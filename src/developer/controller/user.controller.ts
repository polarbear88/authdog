import { Body, Controller, NotAcceptableException, Post, UseGuards } from '@nestjs/common';
import { Application } from 'src/application/application.entity';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AddUserBanlanceDto, AddUserTimeDto, ChangeUserPwdByDevDto, GetUserListDto, OnlyUserIdDto } from 'src/user/user.dto';
import { UserService } from 'src/user/user.service';
import { WriteDeveloperActionLog } from '../action-log/write-developer-action-log.decorator';
import { TakeApplication } from '../decorator/take-application.decorator';
import { AppActionGuard } from '../guard/app-action.guard';

@UseGuards(AppActionGuard)
@Roles(Role.Developer)
@Controller({ version: '1', path: 'user' })
export class UserController extends BaseController {
    constructor(private userService: UserService) {
        super();
    }

    @Post('list')
    async list(@TakeApplication() app: Application, @Body() getUserListDto: GetUserListDto) {
        return this.userService.getList(app.id, getUserListDto);
    }

    @WriteDeveloperActionLog('修改用户密码')
    @Post('change-password')
    async changePassword(@TakeApplication() app: Application, @Body() changeUserPwdByDevDto: ChangeUserPwdByDevDto) {
        const user = await this.userService.changePasswordByDev(app.id, changeUserPwdByDevDto);
        return this.setAffected({}, user.name);
    }

    @WriteDeveloperActionLog('增减时间')
    @Post('add-time')
    async addTime(@TakeApplication() app: Application, @Body() addUserTimeDto: AddUserTimeDto) {
        const user = await this.userService.addTimeByDev(app.id, addUserTimeDto);
        return this.setAffected({}, `${user.name}[${addUserTimeDto.minutes}分钟]`);
    }

    @WriteDeveloperActionLog('增减次数')
    @Post('add-banlance')
    async addBanlance(@TakeApplication() app: Application, @Body() addUserBanlanceDto: AddUserBanlanceDto) {
        const user = await this.userService.addBanlanceByDev(app.id, addUserBanlanceDto);
        return this.setAffected({}, `${user.name}[${addUserBanlanceDto.money}次]`);
    }

    @WriteDeveloperActionLog('解绑设备')
    @Post('unbind')
    async unbind(@TakeApplication() app: Application, @Body() onlyUserIdDto: OnlyUserIdDto) {
        const user = await this.userService.findByAppidAndId(app.id, onlyUserIdDto.id);
        if (!user) {
            throw new NotAcceptableException('用户不存在');
        }
        await this.userService.setCurrentDeviceId(user.id, null);
        return this.setAffected({}, user.name);
    }

    @WriteDeveloperActionLog('重置解绑计数')
    @Post('reset-unbindCount')
    async resetUnbindCount(@TakeApplication() app: Application, @Body() onlyUserIdDto: OnlyUserIdDto) {
        const user = await this.userService.findByAppidAndId(app.id, onlyUserIdDto.id);
        if (!user) {
            throw new NotAcceptableException('用户不存在');
        }
        await this.userService.setUnbindCount(user.id, 0);
        return this.setAffected({}, user.name);
    }
}
