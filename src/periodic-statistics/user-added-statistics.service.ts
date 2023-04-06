import { Injectable, Logger } from '@nestjs/common';
import { PeriodicStatisticsService } from './periodic-statistics.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DeviceService } from 'src/user/device/device.service';
import { PeriodicStatistics } from './periodic-statistics.entity';
import { PeriodicStatisticsCycleEnum, PeriodicStatisticsMatterEnum } from './periodic-statistics.enum';
import { DateUtils } from 'src/common/utils/date.utils';
import { UserService } from 'src/user/user/user.service';

@Injectable()
export class UserAddedStatisticsService {
    constructor(
        private periodicStatisticsService: PeriodicStatisticsService,
        private deviceService: DeviceService,
        private userService: UserService,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        try {
            let data = await this.deviceService
                .getRepo()
                .createQueryBuilder()
                .select(['developerId', 'appid', 'count(1) as addcount'])
                .where('createdAt >= CAST(CURDATE() - INTERVAL 1 DAY AS DATETIME)')
                .andWhere('createdAt < CURDATE()')
                .groupBy('developerId,appid')
                .getRawMany();
            for (const item of data) {
                const row = new PeriodicStatistics();
                row.developerId = item.developerId;
                row.appid = item.appid;
                row.cycle = PeriodicStatisticsCycleEnum.DAILY;
                row.matter = PeriodicStatisticsMatterEnum.USER_ADDED;
                row.startTime = DateUtils.getYesterday();
                row.result = item.addcount;
                await this.periodicStatisticsService.getRepo().save(row);
            }
            data = await this.userService
                .getRepo()
                .createQueryBuilder()
                .select(['developerId', 'appid', 'count(1) as addcount'])
                .where('createdAt >= CAST(CURDATE() - INTERVAL 1 DAY AS DATETIME)')
                .andWhere('createdAt < CURDATE()')
                .groupBy('developerId,appid')
                .getRawMany();
            for (const item of data) {
                const row = new PeriodicStatistics();
                row.developerId = item.developerId;
                row.appid = item.appid;
                row.cycle = PeriodicStatisticsCycleEnum.DAILY;
                row.matter = PeriodicStatisticsMatterEnum.USER_ADDED;
                row.startTime = DateUtils.getYesterday();
                row.result = item.addcount;
                await this.periodicStatisticsService.getRepo().save(row);
            }
        } catch (error) {
            Logger.error(error);
        }
    }
}
