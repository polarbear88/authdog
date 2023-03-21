import { Module } from '@nestjs/common';
import { UserDeviceService } from './user-device.service';

@Module({
    providers: [UserDeviceService],
    exports: [UserDeviceService],
})
export class UserDeviceModule {}
