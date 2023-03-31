import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FundFlowModule } from 'src/fund-flow/fund-flow.module';
import { IPAddrModule } from 'src/ipaddr/ipaddr.module';
import { Saler } from './saler.entity';
import { SalerService } from './saler.service';
import { SalerSubscriber } from './saler.subscriber';

@Module({
    imports: [TypeOrmModule.forFeature([Saler]), IPAddrModule, FundFlowModule],
    providers: [SalerService, SalerSubscriber],
    exports: [SalerService],
})
export class SalerModule {}
