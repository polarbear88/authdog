import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index, Unique } from 'typeorm';

@Unique(['appid', 'name'])
@Entity()
export class RechargeCardType extends BaseEntity {
    @Index()
    @Column()
    appid: number;

    @Column({ length: 16 })
    name: string;

    @Column()
    isNeedPassword: boolean;

    // ${uuid} ${randhex}[10] ${randnum}[10] ${randletter}[10]
    @Column()
    cardFormat: string;

    @Column({ default: '' })
    passwordFormat: string;

    // 分钟
    @Column()
    time: number;

    // 次数
    @Column()
    money: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    salerPrice: number;
}
