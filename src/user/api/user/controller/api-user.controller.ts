import { Body, Controller, Post } from '@nestjs/common';
import { ApiTakeApp } from 'src/user/api/decorator/api-take-app.decorator';
import { ApiTakeUser } from 'src/user/api/decorator/api-take-user.decorator';
import { Application } from 'src/provide/application/application.entity';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { BaseUserDeviceDto } from 'src/user/user-device/user-device.dto';
import { UserReduceCountDto } from 'src/user/user/user.dto';
import { User } from 'src/user/user/user.entity';
import { UserService } from 'src/user/user/user.service';
import { ApiParseUserPipe } from '../api-parse-user.pipe';
import { ApiUserBaseController } from './api-user-base.controller';

@Roles(Role.User)
@Controller({ version: '1' })
export class ApiUserController extends ApiUserBaseController {
    constructor(private userService: UserService) {
        super();
    }

    @Post('poll')
    async poll(@ApiTakeUser(ApiParseUserPipe) user: User, @Body() dto: BaseUserDeviceDto, @ApiTakeApp() app: Application) {
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
    async reduceCount(@ApiTakeUser(ApiParseUserPipe) user: User, @Body() dto: UserReduceCountDto) {
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
}
