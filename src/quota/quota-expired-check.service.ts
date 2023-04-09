import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Developer } from 'src/developer/developer.entity';
import { DeveloperService } from 'src/developer/developer.service';
import { LessThan, Not, Repository } from 'typeorm';

@Injectable()
export class QuotaExpiredCheckService {
    // 周期事件，自动检查开发者的配额是否过期，如果过期则将开发者的配额设置为默认配额
    constructor(private developerService: DeveloperService) {}

    @Cron(CronExpression.EVERY_DAY_AT_3AM)
    async handleCron() {
        const developers = await (this.developerService.getRepo() as Repository<Developer>).find({
            where: {
                quotaExpiredAt: LessThan(new Date()),
                quota: Not('default'),
            },
        });
        for (const developer of developers) {
            developer.quota = 'default';
            developer.quotaExpiredAt = null;
            await this.developerService.getRepo().save(developer);
        }
    }
}
