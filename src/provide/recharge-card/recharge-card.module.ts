import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RechargeCardTypeModule } from './card-type/recharge-card-type.module';
import { RechargeCard } from './recharge-card.entity';
import { RechargeCardService } from './recharge-card.service';

@Module({
    imports: [RechargeCardTypeModule, TypeOrmModule.forFeature([RechargeCard])],
    providers: [RechargeCardService],
    exports: [RechargeCardService, RechargeCardTypeModule],
})
export class RechargeCardModule {}
