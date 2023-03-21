import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';

@Module({
    providers: [DeviceService],
    exports: [DeviceService],
})
export class DeviceModule {}
