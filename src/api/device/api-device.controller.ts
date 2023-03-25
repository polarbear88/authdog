import { Controller, Post } from '@nestjs/common';
import { Application } from 'src/application/application.entity';
import { Public } from 'src/common/decorator/public.decorator';
import { Device } from 'src/device/device.entity';
import { DeviceService } from 'src/device/device.service';
import { ApiTakeApp } from '../decorator/api-take-app.decorator';
import { ApiTakeDevice } from '../decorator/api-take-device.decorator';
import { ApiDeviceBaseController } from './api-device-base.controller';

@Public()
@Controller({ version: '1' })
export class ApiDeviceController extends ApiDeviceBaseController {
    constructor(private deviceService: DeviceService) {
        super();
    }

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
            },
        };
    }
}
