import { Module, SetMetadata } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import { DeveloperModule } from 'src/developer/developer.module';
import { UserDeviceModule } from 'src/user/user-device/user-device.module';
import { ApiAppController } from './api-app.controller';
import { ApiAppService } from './api-app.service';

@SetMetadata(MODULE_PATH, 'app')
@Module({
    imports: [DeveloperModule, UserDeviceModule],
    providers: [ApiAppService],
    controllers: [ApiAppController],
})
export class ApiAppModule {}
