import { Module } from '@nestjs/common';
import { ApiUserModule } from './user/api-user.module';
import { ApiDeviceModule } from './device/api-device.module';
import { ApiAppModule } from './app/api-app.module';
import { ApiCloudvarModule } from './cloudvar/api-cloudvar.module';

@Module({
    imports: [ApiUserModule, ApiDeviceModule, ApiAppModule, ApiCloudvarModule],
    providers: [],
})
export class ApiModule {}
