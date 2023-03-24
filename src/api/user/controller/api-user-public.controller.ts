import { Body, Controller, InternalServerErrorException, NotAcceptableException, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';
import { ApiTakeApp } from 'src/api/decorator/api-take-app.decorator';
import { Application } from 'src/application/application.entity';
import { JwtExpiresInConfig } from 'src/common/config/jwt-expiresIn.config';
import { Public } from 'src/common/decorator/public.decorator';
import { RealIP } from 'src/common/decorator/realip.decorator';
import { Role } from 'src/common/enums/role.enum';
import { StringUtils } from 'src/common/utils/string.utils';
import { ChangePasswordDto, CreateUserDto, LoginUserDto } from 'src/user/user.dto';
import { UserService } from 'src/user/user.service';
import { ApiUserBaseController } from './api-user-base.controller';

@Public()
@Controller({ version: '1', path: 'public' })
export class ApiUserPublicController extends ApiUserBaseController {
    constructor(private userService: UserService, private jwtService: JwtService) {
        super();
    }

    @Throttle(20, 3600)
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto, @RealIP() ip: string, @ApiTakeApp() app: Application) {
        if (await this.userService.existsByName(app.id, createUserDto.name)) {
            throw new NotAcceptableException('用户名已存在');
        }
        if (!StringUtils.isEmpty(createUserDto.mobile) && (await this.userService.existsByMobile(app.id, createUserDto.mobile))) {
            // 由于mobile可由开发者自行保存任何联系方式内容，所以这里提示联系方式已存在
            throw new NotAcceptableException('联系方式已存在');
        }
        const user = await this.userService.create(createUserDto, app, ip);
        if (!user) {
            throw new InternalServerErrorException('注册失败');
        }
        return user;
    }

    @Post('change-password')
    async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
        await this.userService.changePassword(changePasswordDto);
        return null;
    }

    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto, @ApiTakeApp() app: Application) {
        // 验证账号密码和状态
        const user = await this.userService.validateUser(loginUserDto);
        // 验证到期时间
        const authResult = this.userService.validateUserAuth(user, app, loginUserDto.deviceId);
        if (!authResult.result) {
            return {
                user: user._serialization(),
                auth: {
                    result: false,
                    message: authResult.msg,
                    expire: user.expirationTime.getTime(),
                    balance: user.balance,
                },
            };
        }
        if (!app.bindDevice && app.maxMultiDevice > 0) {
            // 如果不绑定设备，且限制最大登录数量 则验证登录设备数量
            const r = await this.userService.validateUserMultipledeviceLogin(user, app, loginUserDto.deviceId);
            if (!r) {
                const maxLength = app.allowMultiDevice ? app.maxMultiDevice : 1;
                return {
                    user: user._serialization(),
                    auth: {
                        result: false,
                        message: `登录设备数量超过限制${maxLength}个}`,
                        expire: user.expirationTime.getTime(),
                        balance: user.balance,
                    },
                };
            }
        }
        // 生成token
        const payload = { username: user.name, id: user.id, roles: [Role.User], deviceId: loginUserDto.deviceId };
        const access_token = this.jwtService.sign(payload, {
            expiresIn: JwtExpiresInConfig.user,
        });
        (user as any).access_token = access_token;
        // 判断是否记录绑定的设备
        if (app.bindDevice && !user.currentDeviceId) {
            // 记录绑定的设备
            await this.userService.setCurrentDeviceId(user.id, loginUserDto.deviceId);
        }
        return {
            user: user._serialization(),
            auth: {
                result: true,
                message: '登录成功',
                expire: user.expirationTime.getTime(),
                balance: user.balance,
                isTryTime: user.trialExpiration.getTime() > new Date().getTime(),
            },
        };
    }

    @Post('unbind')
    async unbind(@Body() loginUserDto: LoginUserDto, @ApiTakeApp() app: Application) {
        // 验证账号密码和状态
        const user = await this.userService.validateUser(loginUserDto);
        if (!app.bindDevice) {
            throw new NotAcceptableException('应用不绑定设备');
        }
        if (!app.allowUnbind) {
            throw new NotAcceptableException('应用不允许解绑');
        }
        if (!user.currentDeviceId) {
            throw new NotAcceptableException('该账号未绑定设备');
        }
        if (app.maxUnbindCount > 0 && user.unbindCount >= app.maxUnbindCount) {
            throw new NotAcceptableException('解绑次数超过限制');
        }
        const time = new Date().getTime();
        if (user.expirationTime.getTime() <= time) {
            throw new NotAcceptableException('账号已过期无法操作');
        }
        if (app.unbindDeductTime > 0 && time - user.expirationTime.getTime() < app.unbindDeductTime * 1000 * 60) {
            throw new NotAcceptableException('账号剩余时间不足，无法扣时');
        }
        if (app.unbindDeductCount > 0 && user.balance < app.unbindDeductCount) {
            throw new NotAcceptableException('账号额度不足，无法扣时');
        }
        // 扣时间和扣次
        if (app.unbindDeductTime > 0 || app.unbindDeductCount > 0) {
            await this.userService.subUserBalanceAndExpirationTime(user, app.unbindDeductTime, app.unbindDeductCount);
        }
        await this.userService.setCurrentDeviceId(user.id, null);
        return null;
    }
}
