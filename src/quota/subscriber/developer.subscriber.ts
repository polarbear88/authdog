import { DataSource, EntitySubscriberInterface, EventSubscriber, Repository, UpdateEvent } from 'typeorm';
import { QuotaService } from '../quota.service';
import { Developer } from 'src/developer/developer.entity';
import { ApplicationService } from 'src/provide/application/application.service';
import { Application } from 'src/provide/application/application.entity';

@EventSubscriber()
export class DeveloperSubscriber implements EntitySubscriberInterface<Developer> {
    constructor(dataSource: DataSource, private applicationService: ApplicationService, private quotaService: QuotaService) {
        dataSource.subscribers.push(this);
    }

    async afterUpdate(event: UpdateEvent<Developer>) {
        if (event.updatedColumns.find((column) => column.propertyName === 'quota')) {
            await this.checkQuota(event.databaseEntity);
        }
    }

    async checkQuota(developer: Developer) {
        const maxAppCount = (await this.quotaService.getByName(developer.quota)).maxAppCount;
        const apps = await (this.applicationService.getRepo() as Repository<Application>).find({
            where: { developerId: developer.id },
            select: ['id', 'deactivated'],
        });
        for (let i = 0; i < apps.length; i++) {
            if (i < maxAppCount) {
                if (apps[i].deactivated) {
                    await this.applicationService.setDeactivated(apps[i].id, false);
                }
            } else {
                if (!apps[i].deactivated) {
                    await this.applicationService.setDeactivated(apps[i].id, true);
                }
            }
        }
    }

    listenTo() {
        return Developer;
    }
}
