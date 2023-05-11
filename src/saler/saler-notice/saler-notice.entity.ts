import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index, Unique } from 'typeorm';

@Unique(['developerId', 'salerId'])
@Entity()
export class SalerNotice extends BaseEntity {
    @Column()
    developerId: number;

    @Column()
    salerId: number;

    @Column('longtext')
    content: string;
}
