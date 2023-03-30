import { Module, SetMetadata } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import { CloudfunModule } from 'src/cloudfun/cloudfun.module';
import { DeveloperModule } from 'src/developer/developer.module';
import { DeviceModule } from 'src/device/device.module';
import { UserDeviceModule } from 'src/user-device/user-device.module';
import { UserModule } from 'src/user/user.module';
import { ApiCloudfunController } from './api-cloudfun.controller';

@SetMetadata(MODULE_PATH, 'cloudfun')
@Module({
    imports: [DeveloperModule, UserDeviceModule, UserModule, DeviceModule, CloudfunModule],
    providers: [],
    controllers: [ApiCloudfunController],
})
export class ApiCloudfunModule {}