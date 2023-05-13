import { Body, Controller, NotAcceptableException, Post, UseGuards } from '@nestjs/common';
import { ApiTakeApp } from 'src/user/api/decorator/api-take-app.decorator';
import { ApiTakeUser } from 'src/user/api/decorator/api-take-user.decorator';
import { Application } from 'src/provide/application/application.entity';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { BaseUserDeviceDto } from 'src/user/user-device/user-device.dto';
import { UserReduceCountDto } from 'src/user/user/user.dto';
import { User } from 'src/user/user/user.entity';
import { UserService } from 'src/user/user/user.service';
import { ApiUserBaseController } from './api-user-base.controller';
import { ApiUserDeviceValidateGuard } from '../api-user-device-validate.guard';
import { OnlineUserManagerService } from 'src/provide/online-user-manager/online-user-manager.service';

@UseGuards(ApiUserDeviceValidateGuard)
@Roles(Role.User)
@Controller({ version: '1' })
export class ApiUserController extends ApiUserBaseController {
    constructor(private userService: UserService, private onlineUserManagerService: OnlineUserManagerService) {
        super();
    }

    @Post('poll')
    async poll(@ApiTakeUser() user: User, @Body() dto: BaseUserDeviceDto, @ApiTakeApp() app: Application) {
        if (app.enableOnlineUserMgr) {
            // 如果开启了在线用户管理器 则检查用户是否太长时间没有连接导致失去登录
            if (!(await this.onlineUserManagerService.isOnline(app, user, dto.deviceId))) {
                throw new NotAcceptableException('已失去登录状态');
            }
            // 同步心跳
            await this.onlineUserManagerService.poll(app, user, dto.deviceId);
        }
        const authResult = this.userService.validateUserAuth(user, app, dto.deviceId);
        return {
            user: user._serialization(),
            auth: {
                result: authResult.result,
                message: authResult.msg,
                expire: user.expirationTime.getTime(),
                balance: user.balance,
            },
        };
    }

    @Post('reduce-count')
    async reduceCount(@ApiTakeUser() user: User, @Body() dto: UserReduceCountDto) {
        if (user.balance < dto.count) {
            return {
                user: user._serialization(),
                result: false,
            };
        }
        const affected = await this.userService.subBanlance(user, dto.count, dto.reason);
        if (affected > 0) {
            user.balance -= dto.count;
        }
        return {
            user: user._serialization(),
            result: affected > 0,
        };
    }

    @Post('logout')
    async logout(@ApiTakeUser() user: User, @Body() dto: BaseUserDeviceDto, @ApiTakeApp() app: Application) {
        if (app.enableOnlineUserMgr) {
            await this.onlineUserManagerService.logout(app, user, dto.deviceId);
        }
        return {};
    }
}
