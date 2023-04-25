import { Module } from '@nestjs/common';
import { ApiUserModule } from './user/api-user.module';
import { ApiDeviceModule } from './device/api-device.module';
import { ApiAppModule } from './app/api-app.module';
import { ApiCloudvarModule } from './cloudvar/api-cloudvar.module';
import { ApiFeedbackModule } from './feedback/api-feedback.module';
import { ApiCloudfunModule } from './cloudfun/api-cloudfun.module';
import { ApiUserDataModule } from './user-data/api-user-data.module';
import { CloudfunModule } from 'src/provide/cloudfun/cloudfun.module';

@Module({
    imports: [
        ApiUserModule,
        ApiDeviceModule,
        ApiAppModule,
        ApiCloudvarModule,
        ApiFeedbackModule,
        ApiCloudfunModule,
        ApiUserDataModule,
        CloudfunModule,
    ],
    providers: [],
})
export class ApiModule {}
