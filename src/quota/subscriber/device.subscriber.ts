import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { DeveloperService } from 'src/developer/developer.service';
import { NotAcceptableException } from '@nestjs/common';
import { QuotaService } from '../quota.service';
import { Device } from 'src/user/device/device.entity';
import { DeviceService } from 'src/user/device/device.service';

@EventSubscriber()
export class DeviceSubscriber implements EntitySubscriberInterface<Device> {
    constructor(
        dataSource: DataSource,
        private deviceService: DeviceService,
        private developerService: DeveloperService,
        private quotaService: QuotaService,
    ) {
        dataSource.subscribers.push(this);
    }

    async beforeInsert(event: InsertEvent<Device>) {
        const quota = await this.quotaService.getByName(await this.developerService.getQuota(event.entity.developerId));
        if (!quota) {
            throw new NotAcceptableException('您暂无配额');
        }
        if ((await this.deviceService.getCountByDeveloperId(event.entity.developerId)) >= quota.maxUserCount) {
            throw new NotAcceptableException('开发者配额用尽，无法创建');
        }
    }

    listenTo() {
        return Device;
    }
}
