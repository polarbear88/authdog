import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { Application } from '../../provide/application/application.entity';
import { ApplicationService } from '../../provide/application/application.service';
import { DeveloperService } from 'src/developer/developer.service';
import { NotAcceptableException } from '@nestjs/common';
import { QuotaService } from '../quota.service';

@EventSubscriber()
export class ApplicationSubscriber implements EntitySubscriberInterface<Application> {
    constructor(
        dataSource: DataSource,
        private applicationService: ApplicationService,
        private developerService: DeveloperService,
        private quotaService: QuotaService,
    ) {
        dataSource.subscribers.push(this);
    }

    async beforeInsert(event: InsertEvent<Application>) {
        const quota = await this.quotaService.getByName(await this.developerService.getQuota(event.entity.developerId));
        if (!quota) {
            throw new NotAcceptableException('您暂无配额');
        }
        if ((await this.applicationService.getDeveloperAppCount(event.entity.developerId)) >= quota.maxAppCount) {
            throw new NotAcceptableException('您的配额已用完，无法创建应用');
        }
    }

    listenTo() {
        return Application;
    }
}
