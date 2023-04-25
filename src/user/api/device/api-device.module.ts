import { Module, SetMetadata } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import { ApplicationModule } from 'src/provide/application/application.module';
import { DeveloperModule } from 'src/developer/developer.module';
import { DeviceModule } from 'src/user/device/device.module';
import { UserDeviceModule } from 'src/user/user-device/user-device.module';
import { ApiDeviceController } from './api-device.controller';
import { CloudfunModule } from 'src/provide/cloudfun/cloudfun.module';

@SetMetadata(MODULE_PATH, 'device')
@Module({
    imports: [DeviceModule, UserDeviceModule, ApplicationModule, DeveloperModule, CloudfunModule],
    controllers: [ApiDeviceController],
})
export class ApiDeviceModule {}
