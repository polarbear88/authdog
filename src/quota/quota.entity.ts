import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class Quota extends BaseEntity {
    @Index()
    @Column()
    name: string;

    @Column()
    chinaName: string;

    @Column()
    maxAppCount: number;

    @Column()
    maxUserCount: number;

    @Column()
    maxCloudfunCount: number;

    @Column()
    maxUserDataCount: number;

    @Column()
    maxSalerCount: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: string;
}
