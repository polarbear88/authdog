import { Module, SetMetadata } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import { CloudfunModule } from 'src/provide/cloudfun/cloudfun.module';
import { DeveloperModule } from 'src/developer/developer.module';
import { DeviceModule } from 'src/user/device/device.module';
import { UserDeviceModule } from 'src/user/user-device/user-device.module';
import { UserModule } from 'src/user/user/user.module';
import { ApiCloudfunController } from './api-cloudfun.controller';
import { QuotaModule } from 'src/quota/quota.module';

@SetMetadata(MODULE_PATH, 'cloudfun')
@Module({
    imports: [DeveloperModule, UserDeviceModule, UserModule, DeviceModule, CloudfunModule, QuotaModule],
    providers: [],
    controllers: [ApiCloudfunController],
})
export class ApiCloudfunModule {}
