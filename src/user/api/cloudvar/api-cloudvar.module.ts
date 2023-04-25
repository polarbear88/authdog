import { Module, SetMetadata } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import { CloudvarModule } from 'src/provide/cloudvar/cloudvar.module';
import { DeveloperModule } from 'src/developer/developer.module';
import { DeviceModule } from 'src/user/device/device.module';
import { UserDeviceModule } from 'src/user/user-device/user-device.module';
import { UserModule } from 'src/user/user/user.module';
import { ApiCloudvarController } from './api-cloudvar.controller';
import { CloudfunModule } from 'src/provide/cloudfun/cloudfun.module';

@SetMetadata(MODULE_PATH, 'cloudvar')
@Module({
    imports: [DeveloperModule, UserDeviceModule, UserModule, DeviceModule, CloudvarModule, CloudfunModule],
    providers: [],
    controllers: [ApiCloudvarController],
})
export class ApiCloudvarModule {}
