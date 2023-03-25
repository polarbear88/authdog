import { Module, SetMetadata } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import { ApplicationModule } from 'src/application/application.module';
import { DeveloperModule } from 'src/developer/developer.module';
import { DeviceModule } from 'src/device/device.module';
import { UserDeviceModule } from 'src/user-device/user-device.module';
import { ApiDeviceController } from './api-device.controller';

@SetMetadata(MODULE_PATH, 'device')
@Module({
    imports: [DeviceModule, UserDeviceModule, ApplicationModule, DeveloperModule],
    controllers: [ApiDeviceController],
})
export class ApiDeviceModule {}
