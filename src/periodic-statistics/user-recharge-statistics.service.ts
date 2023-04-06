import { Injectable, Logger } from '@nestjs/common';
import { PeriodicStatisticsService } from './periodic-statistics.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PeriodicStatistics } from './periodic-statistics.entity';
import { PeriodicStatisticsCycleEnum, PeriodicStatisticsMatterEnum } from './periodic-statistics.enum';
import { DateUtils } from 'src/common/utils/date.utils';
import { RechargeCardService } from 'src/provide/recharge-card/recharge-card.service';

@Injectable()
export class UserRechargeStatisticsService {
    constructor(private periodicStatisticsService: PeriodicStatisticsService, private rechargeCardService: RechargeCardService) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        try {
            const data = await this.rechargeCardService
                .getRepo()
                .createQueryBuilder()
                .select(['developerId', 'appid', 'count(1) as addcount'])
                .where('useTime >= CAST(CURDATE() - INTERVAL 1 DAY AS DATETIME)')
                .andWhere('useTime < CURDATE()')
                .groupBy('developerId,appid')
                .getRawMany();
            for (const item of data) {
                const row = new PeriodicStatistics();
                row.developerId = item.developerId;
                row.appid = item.appid;
                row.cycle = PeriodicStatisticsCycleEnum.DAILY;
                row.matter = PeriodicStatisticsMatterEnum.USER_RECHARGE;
                row.startTime = DateUtils.getYesterday();
                row.result = item.addcount;
                await this.periodicStatisticsService.getRepo().save(row);
            }
        } catch (error) {
            Logger.error(error);
        }
    }
}
