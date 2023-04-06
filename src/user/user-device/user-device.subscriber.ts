import { IPAddrService } from 'src/helpers/ipaddr/ipaddr.service';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { UserDevice } from './user-device.entity';
import { UserDeviceService } from './user-device.service';

@EventSubscriber()
export class UserDeviceSubscriber implements EntitySubscriberInterface<UserDevice> {
    constructor(dataSource: DataSource, private readonly ipaddrService: IPAddrService, private readonly userDeviceService: UserDeviceService) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return UserDevice;
    }

    async afterInsert(event: InsertEvent<UserDevice>) {
        try {
            const iap = await this.ipaddrService.getIPAddrAscriptionPlace(event.entity.ip.ipv4);
            this.userDeviceService.updateDeveloperIAP(event.entity.id, iap);
        } catch (error) {
            // ignore
        }
    }
}
