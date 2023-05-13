import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index, Unique } from 'typeorm';

@Unique(['appid', 'userId', 'deviceId'])
@Index(['developerId', 'userName'])
@Index(['developerId', 'appid'])
@Entity()
export class OnlineUser extends BaseEntity {
    @Index()
    @Column()
    developerId: number;

    @Column()
    appid: number;

    @Column()
    appName: string;

    @Column()
    userId: number;

    @Column()
    userName: string;

    @Column()
    deviceId: string;

    @Column()
    lastOnlineTime: Date;
}
