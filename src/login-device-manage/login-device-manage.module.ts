import { Module } from '@nestjs/common';
import { LoginDeviceManageService } from './login-device-manage.service';

@Module({
    providers: [LoginDeviceManageService],
    exports: [LoginDeviceManageService],
})
export class LoginDeviceManageModule {}
