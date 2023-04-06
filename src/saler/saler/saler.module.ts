import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from 'src/provide/application/application.module';
import { FundFlowModule } from 'src/provide/fund-flow/fund-flow.module';
import { IPAddrModule } from 'src/helpers/ipaddr/ipaddr.module';
import { SalerRolesModule } from 'src/saler/saler-roles/saler-roles.module';
import { SalerEntryLinkModule } from './entry-link/entry-link.module';
import { Saler } from './saler.entity';
import { SalerService } from './saler.service';
import { SalerSubscriber } from './saler.subscriber';

@Module({
    imports: [TypeOrmModule.forFeature([Saler]), IPAddrModule, FundFlowModule, SalerEntryLinkModule, ApplicationModule, SalerRolesModule],
    controllers: [],
    providers: [SalerService, SalerSubscriber],
    exports: [SalerService, SalerEntryLinkModule],
})
export class SalerModule {}
