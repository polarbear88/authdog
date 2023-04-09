import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { DeveloperService } from 'src/developer/developer.service';
import { NotAcceptableException } from '@nestjs/common';
import { QuotaService } from '../quota.service';
import { Cloudfun } from 'src/provide/cloudfun/cloudfun.entity';
import { CloudfunService } from 'src/provide/cloudfun/cloudfun.service';

@EventSubscriber()
export class CloudfunSubscriber implements EntitySubscriberInterface<Cloudfun> {
    constructor(
        dataSource: DataSource,
        private cloudfunServer: CloudfunService,
        private developerService: DeveloperService,
        private quotaService: QuotaService,
    ) {
        dataSource.subscribers.push(this);
    }

    async beforeInsert(event: InsertEvent<Cloudfun>) {
        const quota = await this.quotaService.getByName(await this.developerService.getQuota(event.entity.developerId));
        if (!quota) {
            throw new NotAcceptableException('您暂无配额');
        }
        if ((await this.cloudfunServer.getCountByDeveloperId(event.entity.developerId)) >= quota.maxCloudfunCount) {
            throw new NotAcceptableException('开发者配额用尽，无法创建');
        }
    }

    listenTo() {
        return Cloudfun;
    }
}
