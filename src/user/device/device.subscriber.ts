import { IPAddrService } from 'src/helpers/ipaddr/ipaddr.service';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { Device } from './device.entity';
import { DeviceService } from './device.service';

@EventSubscriber()
export class DeviceSubscriber implements EntitySubscriberInterface<Device> {
    constructor(dataSource: DataSource, private readonly ipaddrService: IPAddrService, private readonly deviceService: DeviceService) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return Device;
    }

    async afterInsert(event: InsertEvent<Device>) {
        try {
            const iap = await this.ipaddrService.getIPAddrAscriptionPlace(event.entity.ip.ipv4);
            this.deviceService.updateDeveloperIAP(event.entity.id, iap);
        } catch (error) {
            // ignore
        }
    }
}
