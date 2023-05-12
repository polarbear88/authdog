import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IPAddrModule } from 'src/helpers/ipaddr/ipaddr.module';
import { IPAddrService } from 'src/helpers/ipaddr/ipaddr.service';
import { RechargeCardModule } from 'src/provide/recharge-card/recharge-card.module';
import { UserFinancialModule } from 'src/user/user-financial/user-financial.module';
import { Device } from './device.entity';
import { DeviceService } from './device.service';
import { DeviceSubscriber } from './device.subscriber';
import { UserDataModule } from 'src/provide/user-data/user-data.module';
import { RechargeRecordModule } from 'src/provide/recharge-record/recharge-record.module';

@Module({
    imports: [TypeOrmModule.forFeature([Device]), IPAddrModule, UserFinancialModule, RechargeCardModule, UserDataModule, RechargeRecordModule],
    providers: [DeviceService, IPAddrService, DeviceSubscriber],
    exports: [DeviceService],
})
export class DeviceModule {}
