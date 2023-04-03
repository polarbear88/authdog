import { BaseEntity } from 'src/common/entity/base.entity';
import { IP } from 'src/common/entity/ip.entity';
import { Column, Entity, Index, Unique } from 'typeorm';
import { SalerStatus } from './saler.type';

@Unique(['developerId', 'mobile'])
@Unique(['developerId', 'name'])
@Index(['developerId', 'parentName'])
@Entity()
export class Saler extends BaseEntity {
    @Index()
    @Column()
    developerId: number;

    @Column({ default: 0 })
    topSalerId: number;

    @Column()
    parentId: number;

    @Column()
    parentName: string;

    @Column({ length: 16 })
    name: string;

    @Column({ length: 18 })
    mobile: string;

    @Column()
    password: string;

    @Column({ default: '' })
    rawPassword: string;

    @Column({ length: 8 })
    salt: string;

    @Column(() => IP)
    ip: IP;

    @Column({ default: () => 'NOW()' })
    lastLoginTime: Date;

    @Column({ default: 'normal' })
    status: SalerStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    balance: string;

    @Column('json')
    apps: Array<{ id: number; name: string }>;

    @Column({ default: '' })
    fromToken: string;

    // 下属代理溢价配置 百分比
    @Column({ type: 'json' })
    subordinatePrice: Array<{ cardTypeId: number; percentage: number }>;

    @Column({ default: 0 })
    salerRoleId: number;

    @Column({ default: '' })
    salerRoleName: string;

    shield = ['password', 'rawPassword', 'salt', 'ip', 'ver'];
}
