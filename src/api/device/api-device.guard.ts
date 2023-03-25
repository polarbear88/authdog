import { Injectable, CanActivate, ExecutionContext, NotAcceptableException, InternalServerErrorException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { Application } from 'src/application/application.entity';
import { DateUtils } from 'src/common/utils/date.utils';
import { ExpressUtils } from 'src/common/utils/express.utils';
import { DeviceDto } from 'src/device/device.dto';
import { DeviceService } from 'src/device/device.service';

/**
 * 用于验证和保存设备信息的守卫
 */
@Injectable()
export class ApiDeviceGuard implements CanActivate {
    constructor(private deviceService: DeviceService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const deviceDto = plainToClass(DeviceDto, request.body);
        const errors = await validate(deviceDto);
        if (errors.length > 0) {
            throw new NotAcceptableException('设备信息不合法');
        }
        const app = request.application as Application;
        if (app.authMode !== 'deviceid') {
            throw new NotAcceptableException('当前应用不支持此操作');
        }
        // 检查是否存在不存在就创建
        let device = await this.deviceService.findByAppidAndDeviceId(app.id, deviceDto.deviceId);
        if (!device) {
            device = await this.deviceService.create(app, deviceDto, ExpressUtils.getIp(request));
        }
        if (!device) {
            throw new InternalServerErrorException('系统错误');
        }
        if (device.status !== 'normal') {
            throw new NotAcceptableException('设备已被禁用');
        }
        if (!DateUtils.compareYMD(new Date(), device.lastLoginTime)) {
            await this.deviceService.setLastLoginTime(device.id);
        }
        request.device = device;
        return true;
    }
}
