import { IPAddrService } from 'src/ipaddr/ipaddr.service';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
    constructor(dataSource: DataSource, private readonly ipaddrService: IPAddrService, private readonly userService: UserService) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return User;
    }

    async afterInsert(event: InsertEvent<User>) {
        try {
            const iap = await this.ipaddrService.getIPAddrAscriptionPlace(event.entity.ip.ipv4);
            this.userService.updateDeveloperIAP(event.entity.id, iap);
        } catch (error) {
            // ignore
        }
    }
}
