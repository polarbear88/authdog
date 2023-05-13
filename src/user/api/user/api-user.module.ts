import { Module, SetMetadata } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import { ApplicationModule } from 'src/provide/application/application.module';
import { DeveloperModule } from 'src/developer/developer.module';
import { UserDeviceModule } from 'src/user/user-device/user-device.module';
import { UserModule } from 'src/user/user/user.module';
import { ApiUserPublicController } from './controller/api-user-public.controller';
import { ApiUserController } from './controller/api-user.controller';
import { AuthModule } from 'src/auth/auth.module';
import { LoginDeviceManageModule } from 'src/user/login-device-manage/login-device-manage.module';
import { CloudfunModule } from 'src/provide/cloudfun/cloudfun.module';
import { OnlineUserManagerModule } from 'src/provide/online-user-manager/online-user-manager.module';

@SetMetadata(MODULE_PATH, 'user')
@Module({
    imports: [
        UserModule,
        UserDeviceModule,
        ApplicationModule,
        DeveloperModule,
        AuthModule,
        LoginDeviceManageModule,
        CloudfunModule,
        OnlineUserManagerModule,
    ],
    controllers: [ApiUserPublicController, ApiUserController],
})
export class ApiUserModule {}
