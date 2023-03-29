import { Module, SetMetadata } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import { DeveloperModule } from 'src/developer/developer.module';
import { DeviceModule } from 'src/device/device.module';
import { UserDeviceModule } from 'src/user-device/user-device.module';
import { UserModule } from 'src/user/user.module';

@SetMetadata(MODULE_PATH, 'cloudvar')
@Module({
    imports: [DeveloperModule, UserDeviceModule, UserModule, DeviceModule],
    providers: [],
    controllers: [],
})
export class ApiCloudvarModule {}
