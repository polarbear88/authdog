import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Application } from 'src/provide/application/application.entity';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AddUserBanlanceDto, AddUserTimeDto, ChangeUserPwdByDevDto, GetUserListDto, OnlyUserIdDto, SetUserStatusDto } from 'src/user/user/user.dto';
import { User } from 'src/user/user/user.entity';
import { UserService } from 'src/user/user/user.service';
import { UserStatus } from 'src/user/user/user.type';
import { UpdateQueryBuilder } from 'typeorm';
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
        const affected = await this.userService.addTimeByDev(app.id, addUserTimeDto);
        return this.setAffected({ affectedCount: affected }, `操作${affected}个用户[${addUserTimeDto.minutes}分钟]`);
    }

    @WriteDeveloperActionLog('增减积分')
    @Post('add-balance')
    async addBanlance(@TakeApplication() app: Application, @Body() addUserBanlanceDto: AddUserBanlanceDto) {
        const affected = await this.userService.addBanlanceByDev(app.id, addUserBanlanceDto);
        return this.setAffected({ affectedCount: affected }, `操作${affected}个用户[${addUserBanlanceDto.money}次]`);
    }

    @WriteDeveloperActionLog('解绑设备')
    @Post('unbind')
    async unbind(@TakeApplication() app: Application, @Body() onlyUserIdDto: OnlyUserIdDto) {
        const affected = await this.userService.setCurrentDeviceIdByIds(onlyUserIdDto.ids, null, (query: UpdateQueryBuilder<User>) => {
            query.andWhere('appid = :appid', { appid: app.id });
        });
        return this.setAffected({ affectedCount: affected }, `操作${affected}个用户`);
    }

    @WriteDeveloperActionLog('重置解绑计数')
    @Post('reset-unbindCount')
    async resetUnbindCount(@TakeApplication() app: Application, @Body() onlyUserIdDto: OnlyUserIdDto) {
        const affected = await this.userService.setUnbindCountByIds(onlyUserIdDto.ids, 0, (query: UpdateQueryBuilder<User>) => {
            query.andWhere('appid = :appid', { appid: app.id });
        });
        return this.setAffected({ affectedCount: affected }, `操作${affected}个用户`);
    }

    @WriteDeveloperActionLog('设置用户状态')
    @Post('set-status')
    async setStatus(@TakeApplication() app: Application, @Body() setUserStatusDto: SetUserStatusDto) {
        const affected = await this.userService.setStatusByIds(
            setUserStatusDto.ids,
            setUserStatusDto.status as UserStatus,
            (query: UpdateQueryBuilder<User>) => {
                query.andWhere('appid = :appid', { appid: app.id });
            },
        );
        return this.setAffected({ affectedCount: affected }, `操作${affected}个用户[${setUserStatusDto.status}]`);
    }

    @WriteDeveloperActionLog('删除用户')
    @Post('delete')
    async delete(@TakeApplication() app: Application, @Body() onlyUserIdDto: OnlyUserIdDto) {
        const affected = await this.userService.deleteByIds(app.developerId, onlyUserIdDto.ids);
        return this.setAffected({ affectedCount: affected }, `操作${affected}个用户`);
    }
}
