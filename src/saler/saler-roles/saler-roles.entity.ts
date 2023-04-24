import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index, Unique } from 'typeorm';

@Unique(['developerId', 'salerId', 'name'])
@Index(['developerId', 'salerId'])
@Entity()
export class SalerRoles extends BaseEntity {
    @Index()
    @Column()
    developerId: number;

    @Column({ default: 0 })
    salerId: number;

    @Column()
    name: string;

    @Column({ type: 'json' })
    priceConfig: Array<{
        appid: number;
        cardTypeId: number;
        topSalerPrice: number;
        // topSalerPrice在下级代理时，是代理的溢价 percentage
    }>;
}
