import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Application } from 'src/provide/application/application.entity';
import { Public } from 'src/common/decorator/public.decorator';
import { DeviceRechargeDto, DeviceReduceCountDto } from 'src/user/device/device.dto';
import { Device } from 'src/user/device/device.entity';
import { DeviceService } from 'src/user/device/device.service';
import { ApiAppVersionCheckGuard } from '../api-app-version-check.guard';
import { ApiTakeApp } from '../decorator/api-take-app.decorator';
import { ApiTakeDevice } from '../decorator/api-take-device.decorator';
import { ApiDeviceBaseController } from './api-device-base.controller';

@Public()
@Controller({ version: '1' })
export class ApiDeviceController extends ApiDeviceBaseController {
    constructor(private deviceService: DeviceService) {
        super();
    }

    @UseGuards(ApiAppVersionCheckGuard)
    @Post('auth')
    async auth(@ApiTakeDevice() device: Device, @ApiTakeApp() app: Application) {
        const authResult = this.deviceService.validateUserAuth(app, device);
        return {
            device: device._serialization(),
            auth: {
                result: authResult.result,
                message: authResult.msg,
                expire: device.expirationTime.getTime(),
                balance: device.balance,
                isTryTime: device.trialExpiration.getTime() > new Date().getTime(),
            },
        };
    }

    @UseGuards(ApiAppVersionCheckGuard)
    @Throttle(200, 3600)
    @Post('recharge')
    async recharge(@Body() dto: DeviceRechargeDto, @ApiTakeDevice() device: Device, @ApiTakeApp() app: Application) {
        await this.deviceService.recharge(device, dto, app);
        return null;
    }

    @Post('info')
    async getInfo(@ApiTakeDevice() device: Device) {
        return device._serialization();
    }

    @Post('reduce-count')
    async reduceCount(@ApiTakeDevice() device: Device, @Body() dto: DeviceReduceCountDto) {
        if (device.balance < dto.count) {
            return {
                device: device._serialization(),
                result: false,
            };
        }
        const affected = await this.deviceService.subBanlance(device, dto.count, dto.reason);
        if (affected > 0) {
            device.balance -= dto.count;
        }
        return {
            device: device._serialization(),
            result: affected > 0,
        };
    }
}
