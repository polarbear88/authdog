import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RechargeCardType } from './recharge-card-type.entity';
import { RechargeCardTypeService } from './recharge-card-type.service';

@Module({
    imports: [TypeOrmModule.forFeature([RechargeCardType])],
    providers: [RechargeCardTypeService],
    exports: [RechargeCardTypeService],
})
export class RechargeCardTypeModule {}
