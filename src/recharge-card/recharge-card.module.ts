import { Module } from '@nestjs/common';
import { RechargeCardTypeModule } from './card-type/recharge-card-type.module';
import { RechargeCardService } from './recharge-card.service';

@Module({
    imports: [RechargeCardTypeModule],
    providers: [RechargeCardService],
    exports: [RechargeCardService, RechargeCardTypeModule],
})
export class RechargeCardModule {}
