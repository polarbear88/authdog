import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index, Unique } from 'typeorm';
import { RechargeCardStatus } from './recharge-card.type';

@Unique(['appid', 'card'])
@Entity()
export class RechargeCard extends BaseEntity {
    @Index()
    @Column()
    appid: number;

    @Column()
    cardTypeId: number;

    @Column()
    cardTypeName: string;

    @Column()
    card: string;

    @Column({ default: '' })
    password: string;

    @Column({ default: '' })
    desc: string;

    // 充值的时间
    @Column()
    time: number;

    // 充值的次数
    @Column()
    money: number;

    @Column()
    status: RechargeCardStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    // 如果是0 表示开发者创建的
    @Column()
    creator: number;

    @Column()
    creatorName: string;

    // 使用者或设备
    @Column({ nullable: true })
    user: number;

    // 使用时间
    @Column({ nullable: true })
    useTime: Date;

    // 使用者名称 或设备ID
    @Column({ nullable: true })
    userName: string;

    // 创建细节，记录多级代理的扣费细节
    @Column({ nullable: true })
    createDetail: string;
}
