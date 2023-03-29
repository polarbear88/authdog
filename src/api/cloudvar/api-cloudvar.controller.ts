import { Body, Controller, NotAcceptableException, Post, Req, UseInterceptors } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Application } from 'src/application/application.entity';
import { GetCloudvarDto } from 'src/cloudvar/cloudvar.dto';
import { CloudvarService } from 'src/cloudvar/cloudvar.service';
import { BaseController } from 'src/common/controller/base.controller';
import { Public } from 'src/common/decorator/public.decorator';
import { Role } from 'src/common/enums/role.enum';
import { DeveloperService } from 'src/developer/developer.service';
import { DeviceService } from 'src/device/device.service';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { ApiEncryptInterceptor } from '../api-encrypt.interceptor';
import { ApiUserDeviceInterceptor } from '../api-user-device.interceptor';
import { ApiTakeApp } from '../decorator/api-take-app.decorator';

@Public()
@UseInterceptors(ApiUserDeviceInterceptor, ApiEncryptInterceptor)
@Controller({ version: '1' })
export class ApiCloudvarController extends BaseController {
    constructor(
        private cloudvarService: CloudvarService,
        private developerService: DeveloperService,
        private jwtService: JwtService,
        private userService: UserService,
        private deviceService: DeviceService,
    ) {
        super();
    }

    @Post('get')
    async get(@ApiTakeApp() app: Application, @Body() dto: GetCloudvarDto, @Req() request: any) {
        if ((await this.developerService.getStatus(app.developerId)) !== 'normal') {
            throw new NotAcceptableException('开发者已被禁用');
        }
        const cloudvar = await this.cloudvarService.findByDeveloperIdAndId(app.developerId, dto.id);
        if (!cloudvar) {
            throw new NotAcceptableException('变量不存在');
        }
        if (!cloudvar.isGlobal && cloudvar.applicationId !== app.id) {
            throw new NotAcceptableException('变量不存在');
        }
        if (!cloudvar.isPublic) {
            if (app.authMode === 'user') {
                const token = request.headers['token'] as string;
                if (!token) {
                    throw new NotAcceptableException('未登录');
                }
                try {
                    const decode = this.jwtService.verify(token);
                    if (!(decode.roles as Array<string>).includes(Role.User)) {
                        throw new NotAcceptableException('未登录');
                    }
                    const user = (await this.userService.findById(decode.id)) as User;
                    if (!user || user.appid !== app.id) {
                        throw new NotAcceptableException('未登录');
                    }
                    if (user.status !== 'normal') {
                        throw new NotAcceptableException('用户已被禁用');
                    }
                    if (!this.userService.validateUserAuth(user, app, dto.deviceId).result) {
                        throw new NotAcceptableException('用户未授权');
                    }
                } catch (error) {
                    throw new NotAcceptableException('未登录');
                }
            } else {
                const device = await this.deviceService.findByAppidAndDeviceId(app.id, dto.deviceId);
                if (!device || device.status !== 'normal') {
                    throw new NotAcceptableException('设备已被禁用');
                }
                if (!this.deviceService.validateUserAuth(app, device).result) {
                    throw new NotAcceptableException('用户未授权');
                }
            }
        }
        return {
            value: cloudvar.value,
        };
    }
}
