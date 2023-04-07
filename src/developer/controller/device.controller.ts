import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Application } from 'src/provide/application/application.entity';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AddDeviceBanlanceDto, AddDeviceTimeDto, GetDeviceListDto, SetDeviceStatusDto } from 'src/user/device/device.dto';
import { Device } from 'src/user/device/device.entity';
import { DeviceService } from 'src/user/device/device.service';
import { UserStatus } from 'src/user/user/user.type';
import { UpdateQueryBuilder } from 'typeorm';
import { WriteDeveloperActionLog } from '../action-log/write-developer-action-log.decorator';
import { TakeApplication } from '../decorator/take-application.decorator';
import { AppActionGuard } from '../guard/app-action.guard';
import { OnlyUserIdDto } from 'src/user/user/user.dto';

@UseGuards(AppActionGuard)
@Roles(Role.Developer)
@Controller({ version: '1', path: 'device' })
export class DeviceController extends BaseController {
    constructor(private deviceService: DeviceService) {
        super();
    }

    @Post('list')
    async list(@TakeApplication() app: Application, @Body() getDeviceListDto: GetDeviceListDto) {
        return this.deviceService.getList(app.id, getDeviceListDto);
    }

    @WriteDeveloperActionLog('增减时间')
    @Post('add-time')
    async addTime(@TakeApplication() app: Application, @Body() addDeviceTimeDto: AddDeviceTimeDto) {
        const affected = await this.deviceService.addTimeByDev(app.id, addDeviceTimeDto);
        return this.setAffected({ affectedCount: affected }, `操作${affected}个设备[${addDeviceTimeDto.minutes}分钟]`);
    }

    @WriteDeveloperActionLog('增减次数')
    @Post('add-balance')
    async addBanlance(@TakeApplication() app: Application, @Body() addDeviceBanlanceDto: AddDeviceBanlanceDto) {
        const affected = await this.deviceService.addBanlanceByDev(app.id, addDeviceBanlanceDto);
        return this.setAffected({ affectedCount: affected }, `操作${affected}个设备[${addDeviceBanlanceDto.money}次]`);
    }

    @WriteDeveloperActionLog('设置设备状态')
    @Post('set-status')
    async setStatus(@TakeApplication() app: Application, @Body() setDeviceStatusDto: SetDeviceStatusDto) {
        const affected = await this.deviceService.setStatusByIds(
            setDeviceStatusDto.ids,
            setDeviceStatusDto.status as UserStatus,
            (query: UpdateQueryBuilder<Device>) => {
                query.andWhere('appid = :appid', { appid: app.id });
            },
        );
        return this.setAffected({ affectedCount: affected }, `操作${affected}个设备[${setDeviceStatusDto.status}]`);
    }

    @WriteDeveloperActionLog('删除用户]')
    @Post('delete')
    async delete(@TakeApplication() app: Application, @Body() onlyUserIdDto: OnlyUserIdDto) {
        const affected = await this.deviceService.deleteByIds(app.developerId, onlyUserIdDto.ids);
        return this.setAffected({ affectedCount: affected }, `操作${affected}个用户`);
    }
}
