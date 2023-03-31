import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index, Unique } from 'typeorm';

@Unique(['token'])
@Entity()
export class SalerEntryLink extends BaseEntity {
    @Column()
    name: string;

    @Index()
    @Column()
    developerId: number;

    @Index()
    @Column()
    salerId: number;

    @Column({ default: '' })
    salerName: string;

    @Column()
    type: 'login' | 'register';

    @Column()
    token: string;
}
