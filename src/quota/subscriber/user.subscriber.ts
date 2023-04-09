import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { DeveloperService } from 'src/developer/developer.service';
import { NotAcceptableException } from '@nestjs/common';
import { QuotaService } from '../quota.service';
import { User } from 'src/user/user/user.entity';
import { UserService } from 'src/user/user/user.service';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
    constructor(
        dataSource: DataSource,
        private userService: UserService,
        private developerService: DeveloperService,
        private quotaService: QuotaService,
    ) {
        dataSource.subscribers.push(this);
    }

    async beforeInsert(event: InsertEvent<User>) {
        const quota = await this.quotaService.getByName(await this.developerService.getQuota(event.entity.developerId));
        if (!quota) {
            throw new NotAcceptableException('您暂无配额');
        }
        if ((await this.userService.getCountByDeveloperId(event.entity.developerId)) >= quota.maxUserCount) {
            throw new NotAcceptableException('开发者配额用尽，无法创建用户');
        }
    }

    listenTo() {
        return User;
    }
}
