import { Module, SetMetadata } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import { ApplicationModule } from 'src/application/application.module';
import { DeveloperModule } from 'src/developer/developer.module';
import { UserDeviceModule } from 'src/user-device/user-device.module';
import { UserModule } from 'src/user/user.module';
import { ApiUserPublicController } from './controller/api-user-public.controller';

@SetMetadata(MODULE_PATH, 'user')
@Module({
    imports: [UserModule, UserDeviceModule, ApplicationModule, DeveloperModule],
    controllers: [ApiUserPublicController],
})
export class ApiUserModule {}
