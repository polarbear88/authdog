import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index, Unique } from 'typeorm';

@Unique(['developerId', 'name'])
@Index(['developerId', 'applicationId'])
@Entity()
export class Cloudvar extends BaseEntity {
    @Index()
    @Column()
    developerId: number;

    @Column()
    name: string;

    @Column({ default: '' })
    description: string;

    @Column({ type: 'text' })
    value: string;

    @Column()
    isPublic: boolean;

    @Column()
    isGlobal: boolean;

    @Column({ default: 0 })
    applicationId: number;

    @Column({ default: '' })
    applicationName: string;
}
