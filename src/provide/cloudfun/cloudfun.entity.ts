import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index, Unique } from 'typeorm';
import { CloudfunType } from './cloudfun.type';

@Unique(['developerId', 'name'])
@Index(['developerId', 'applicationId'])
@Entity()
export class Cloudfun extends BaseEntity {
    @Index()
    @Column()
    developerId: number;

    @Column()
    name: string;

    @Column({ default: 'VM-JS' })
    type: CloudfunType;

    @Column({ type: 'longtext' })
    script: string;

    @Column({ default: '' })
    funName: string;

    @Column({ default: '' })
    description: string;

    @Column()
    isGlobal: boolean;

    @Column({ default: 0 })
    applicationId: number;

    @Column({ default: '' })
    applicationName: string;

    shield = ['script'];
}
