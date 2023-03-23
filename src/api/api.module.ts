import { Module } from '@nestjs/common';
import { ApiUserModule } from './user/api-user.module';
import { ApiDeviceModule } from './device/api-device.module';
import { ApiAppModule } from './app/api-app.module';

@Module({
    imports: [ApiUserModule, ApiDeviceModule, ApiAppModule],
    providers: [],
})
export class ApiModule {}
