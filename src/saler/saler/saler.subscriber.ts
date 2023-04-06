import { IPAddrService } from 'src/helpers/ipaddr/ipaddr.service';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { Saler } from './saler.entity';
import { SalerService } from './saler.service';

@EventSubscriber()
export class SalerSubscriber implements EntitySubscriberInterface<Saler> {
    constructor(dataSource: DataSource, private readonly ipaddrService: IPAddrService, private readonly salerService: SalerService) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return Saler;
    }

    async afterInsert(event: InsertEvent<Saler>) {
        try {
            const iap = await this.ipaddrService.getIPAddrAscriptionPlace(event.entity.ip.ipv4);
            this.salerService.updateDeveloperIAP(event.entity.id, iap);
        } catch (error) {
            // ignore
        }
    }
}
