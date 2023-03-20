import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index, Unique } from 'typeorm';

@Unique(['developerId', 'name'])
@Entity()
export class Cloudvar extends BaseEntity {
    @Index()
    @Column()
    developerId: number;

    @Column()
    name: string;

    @Column({ default: '' })
    desc: string;

    @Column({ type: 'text' })
    value: string;

    @Column()
    isPublic: boolean;

    @Column()
    isGlobal: boolean;

    @Column({ default: 0 })
    applicationId: number;
}
