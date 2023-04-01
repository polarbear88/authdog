import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from 'src/application/application.module';
import { FundFlowModule } from 'src/fund-flow/fund-flow.module';
import { IPAddrModule } from 'src/ipaddr/ipaddr.module';
import { SalerEntryLinkModule } from './entry-link/entry-link.module';
import { Saler } from './saler.entity';
import { SalerService } from './saler.service';
import { SalerSubscriber } from './saler.subscriber';

@Module({
    imports: [TypeOrmModule.forFeature([Saler]), IPAddrModule, FundFlowModule, SalerEntryLinkModule, ApplicationModule],
    controllers: [],
    providers: [SalerService, SalerSubscriber],
    exports: [SalerService, SalerEntryLinkModule],
})
export class SalerModule {}
