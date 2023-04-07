import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';
import { UserDataModule } from '../user-data/user-data.module';
import { UserModule } from 'src/user/user/user.module';
import { DeviceModule } from 'src/user/device/device.module';
import { UserFinancialModule } from 'src/user/user-financial/user-financial.module';
import { UserDeviceModule } from 'src/user/user-device/user-device.module';
import { RechargeCardTypeModule } from '../recharge-card/card-type/recharge-card-type.module';
import { RechargeCardModule } from '../recharge-card/recharge-card.module';
import { FeedbackModule } from '../feedback/feedback.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Application]),
        UserDataModule,
        UserModule,
        DeviceModule,
        UserFinancialModule,
        UserDeviceModule,
        RechargeCardTypeModule,
        RechargeCardModule,
        FeedbackModule,
    ],
    providers: [ApplicationService],
    exports: [ApplicationService],
})
export class ApplicationModule {}
