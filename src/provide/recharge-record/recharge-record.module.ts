import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RechargeRecord } from './recharge-record.entity';
import { RechargeRecordService } from './recharge-record.service';

@Module({
    imports: [TypeOrmModule.forFeature([RechargeRecord])],
    providers: [RechargeRecordService],
    exports: [RechargeRecordService],
})
export class RechargeRecordModule {}
