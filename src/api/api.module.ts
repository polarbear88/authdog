import { Module } from '@nestjs/common';
import { ApiUserModule } from './user/api-user.module';
import { ApiDeviceModule } from './device/api-device.module';

@Module({
    imports: [ApiUserModule, ApiDeviceModule],
})
export class ApiModule {}
