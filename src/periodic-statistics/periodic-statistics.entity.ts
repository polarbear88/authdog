import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class PeriodicStatistics extends BaseEntity {
    @Index()
    @Column()
    developerId: number;

    @Index()
    @Column()
    appid: number;

    // 统计周期
    @Column()
    cycle: string;

    // 统计事项
    @Column()
    matter: string;

    // 统计开始时间
    @Index()
    @Column()
    startTime: Date;

    // 统计结果
    @Column()
    result: string;
}
