import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { DeveloperService } from 'src/developer/developer.service';
import { NotAcceptableException } from '@nestjs/common';
import { QuotaService } from '../quota.service';
import { UserData } from 'src/provide/user-data/user-data.entity';
import { UserDataService } from 'src/provide/user-data/user-data.service';

@EventSubscriber()
export class UserDataSubscriber implements EntitySubscriberInterface<UserData> {
    constructor(
        dataSource: DataSource,
        private userDataService: UserDataService,
        private developerService: DeveloperService,
        private quotaService: QuotaService,
    ) {
        dataSource.subscribers.push(this);
    }

    async beforeInsert(event: InsertEvent<UserData>) {
        const quota = await this.quotaService.getByName(await this.developerService.getQuota(event.entity.developerId));
        if (!quota) {
            throw new NotAcceptableException('您暂无配额');
        }
        if ((await this.userDataService.getCountByDeveloperId(event.entity.developerId)) >= quota.maxUserDataCount) {
            throw new NotAcceptableException('开发者配额用尽，无法创建');
        }
    }

    listenTo() {
        return UserData;
    }
}
