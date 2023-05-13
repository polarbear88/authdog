import { Module, SetMetadata } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import { DeveloperModule } from 'src/developer/developer.module';
import { UserDataModule } from 'src/provide/user-data/user-data.module';
import { DeviceModule } from 'src/user/device/device.module';
import { UserDeviceModule } from 'src/user/user-device/user-device.module';
import { UserModule } from 'src/user/user/user.module';
import { CloudfunModule } from 'src/provide/cloudfun/cloudfun.module';
import { ApiUserFinancialController } from './api-user-financial.controller';
import { UserFinancialModule } from 'src/user/user-financial/user-financial.module';

@SetMetadata(MODULE_PATH, 'user-financial')
@Module({
    imports: [DeveloperModule, UserDeviceModule, UserModule, DeviceModule, UserDataModule, CloudfunModule, UserFinancialModule],
    providers: [],
    controllers: [ApiUserFinancialController],
})
export class ApiUserFinancialModule {}
