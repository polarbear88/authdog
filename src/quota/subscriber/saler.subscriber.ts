import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { DeveloperService } from 'src/developer/developer.service';
import { NotAcceptableException } from '@nestjs/common';
import { QuotaService } from '../quota.service';
import { Saler } from 'src/saler/saler/saler.entity';
import { SalerService } from 'src/saler/saler/saler.service';

@EventSubscriber()
export class SalerSubscriber implements EntitySubscriberInterface<Saler> {
    constructor(
        dataSource: DataSource,
        private salerService: SalerService,
        private developerService: DeveloperService,
        private quotaService: QuotaService,
    ) {
        dataSource.subscribers.push(this);
    }

    async beforeInsert(event: InsertEvent<Saler>) {
        const quota = await this.quotaService.getByName(await this.developerService.getQuota(event.entity.developerId));
        if (!quota) {
            throw new NotAcceptableException('您暂无配额');
        }
        if ((await this.salerService.getCountByDeveloperId(event.entity.developerId)) >= quota.maxSalerCount) {
            throw new NotAcceptableException('开发者配额用尽，无法创建');
        }
    }

    listenTo() {
        return Saler;
    }
}
