import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class QuotaCard extends BaseEntity {
    @Index()
    @Column()
    card: string;

    @Column()
    quota: string;

    @Column({ default: 'unused' })
    status: 'unused' | 'used';

    @Column({ nullable: true })
    usedAt: Date;

    @Column({ nullable: true })
    usedBy: string;

    @Column({ nullable: true })
    developerId: number;
}
