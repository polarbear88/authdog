import { AppAuthMode } from 'src/application/application.type';
import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index } from 'typeorm';

// 记录用户财产动态 包括时间和次数
@Index(['appid', 'userType', 'userId'])
@Index(['appid', 'userType', 'name'])
@Entity()
export class UserFinancial extends BaseEntity {
    @Column()
    appid: number;

    @Column()
    userType: AppAuthMode;

    // 用户id或者设备表id
    @Column()
    userId: number;

    // 用户名或者设备ID
    @Column()
    name: string;

    @Column()
    type: 'time' | 'balance';

    @Column()
    direction: 'in' | 'out';

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    value: number;

    @Column()
    before: string;

    @Column()
    reason: string;

    @Column({ nullable: true })
    other: string;
}
