import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class RechargeRecord extends BaseEntity {
    @Index()
    @Column()
    developerId: number;

    @Index()
    @Column()
    appid: number;

    @Column()
    appName: string;

    @Column()
    cardTypeId: number;

    @Index()
    @Column()
    cardTypeName: string;

    @Column()
    cardId: number;

    @Index()
    @Column()
    cardNumber: string;

    @Column()
    time: number;

    @Column()
    money: number;

    @Column()
    salerId: number;

    @Index()
    @Column()
    salerName: string;

    @Column({ nullable: true })
    user: number;

    @Index()
    @Column({ nullable: true })
    userName: string;
}
