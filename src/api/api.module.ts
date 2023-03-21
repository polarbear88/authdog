import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { DeviceModule } from './device/device.module';

@Module({
    imports: [UserModule, DeviceModule],
})
export class ApiModule {}
