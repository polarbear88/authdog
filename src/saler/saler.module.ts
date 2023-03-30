import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IPAddrModule } from 'src/ipaddr/ipaddr.module';
import { Saler } from './saler.entity';
import { SalerService } from './saler.service';
import { SalerSubscriber } from './saler.subscriber';

@Module({
    imports: [TypeOrmModule.forFeature([Saler]), IPAddrModule],
    providers: [SalerService, SalerSubscriber],
    exports: [SalerService],
})
export class SalerModule {}
