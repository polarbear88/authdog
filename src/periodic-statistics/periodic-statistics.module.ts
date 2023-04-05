import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeriodicStatistics } from './periodic-statistics.entity';
import { PeriodicStatisticsService } from './periodic-statistics.service';
import { UserAddedStatisticsService } from './user-added-statistics.service';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from 'src/user/user.module';
import { DeviceModule } from 'src/device/device.module';
import { UserRechargeStatisticsService } from './user-recharge-statistics.service';
import { RechargeCardModule } from 'src/recharge-card/recharge-card.module';

@Module({
    imports: [TypeOrmModule.forFeature([PeriodicStatistics]), ScheduleModule.forRoot(), UserModule, DeviceModule, RechargeCardModule],
    providers: [PeriodicStatisticsService, UserAddedStatisticsService, UserRechargeStatisticsService],
    exports: [PeriodicStatisticsService],
})
export class PeriodicStatisticsModule {}
