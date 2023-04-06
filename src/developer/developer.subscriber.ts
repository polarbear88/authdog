import { IPAddrService } from 'src/helpers/ipaddr/ipaddr.service';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { Developer } from './developer.entity';
import { DeveloperService } from './developer.service';

@EventSubscriber()
export class DeveloperSubscriber implements EntitySubscriberInterface<Developer> {
    constructor(dataSource: DataSource, private readonly ipaddrService: IPAddrService, private readonly developerService: DeveloperService) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return Developer;
    }

    async afterInsert(event: InsertEvent<Developer>) {
        try {
            const iap = await this.ipaddrService.getIPAddrAscriptionPlace(event.entity.ip.ipv4);
            this.developerService.updateDeveloperIAP(event.entity.id, iap);
        } catch (error) {
            // ignore
        }
    }
}
