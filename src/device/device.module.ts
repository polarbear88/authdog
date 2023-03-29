import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IPAddrModule } from 'src/ipaddr/ipaddr.module';
import { IPAddrService } from 'src/ipaddr/ipaddr.service';
import { RechargeCardModule } from 'src/recharge-card/recharge-card.module';
import { UserFinancialModule } from 'src/user-financial/user-financial.module';
import { Device } from './device.entity';
import { DeviceService } from './device.service';
import { DeviceSubscriber } from './device.subscriber';

@Module({
    imports: [TypeOrmModule.forFeature([Device]), IPAddrModule, UserFinancialModule, RechargeCardModule],
    providers: [DeviceService, IPAddrService, DeviceSubscriber],
    exports: [DeviceService],
})
export class DeviceModule {}
