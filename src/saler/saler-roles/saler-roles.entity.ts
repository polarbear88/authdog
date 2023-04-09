import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index, Unique } from 'typeorm';

@Unique(['developerId', 'name'])
@Entity()
export class SalerRoles extends BaseEntity {
    @Index()
    @Column()
    developerId: number;

    @Column()
    name: string;

    @Column({ type: 'json' })
    priceConfig: Array<{
        appid: number;
        cardTypeId: number;
        topSalerPrice: number;
    }>;
}
