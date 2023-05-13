import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FundFlow } from './fund-flow.entity';
import { FundFlowService } from './fund-flow.service';

// 用户资产明细模块
@Module({
    imports: [TypeOrmModule.forFeature([FundFlow])],
    providers: [FundFlowService],
    exports: [FundFlowService],
})
export class FundFlowModule {}
