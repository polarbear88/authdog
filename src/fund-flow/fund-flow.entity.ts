import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Index(['developerId', 'salerName'])
@Index(['developerId', 'reason'])
@Entity()
export class FundFlow extends BaseEntity {
    @Column()
    roleType: 'developer' | 'saler';

    @Index()
    @Column()
    developerId: number;

    @Column()
    developerName: string;

    @Index()
    @Column({ nullable: true })
    salerId: number;

    @Column({ nullable: true })
    salerName: string;

    @Column()
    direction: 'in' | 'out';

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    amount: string;

    @Column()
    reason: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    before: string;

    @Column({ nullable: true })
    other: string;
}
