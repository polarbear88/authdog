import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Unique } from 'typeorm';

@Unique(['card'])
@Entity()
export class QuotaCard extends BaseEntity {
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
