import { Module, SetMetadata } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import { ApplicationModule } from 'src/application/application.module';
import { UserDeviceModule } from 'src/user-device/user-device.module';
import { ApiUserPublicController } from './controller/user-public.controller';

@SetMetadata(MODULE_PATH, 'user')
@Module({
    imports: [UserModule, UserDeviceModule, ApplicationModule],
    controllers: [ApiUserPublicController],
})
export class UserModule {}
