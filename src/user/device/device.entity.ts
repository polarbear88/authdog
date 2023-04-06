import { BaseEntity } from 'src/common/entity/base.entity';
import { IP } from 'src/common/entity/ip.entity';
import { Column, Entity, Index, Unique } from 'typeorm';
import { UserStatus } from '../user/user.type';

@Unique(['appid', 'deviceId'])
@Entity()
export class Device extends BaseEntity {
    @Index()
    @Column()
    developerId: number;

    @Index()
    @Column()
    appid: number;

    @Column()
    deviceId: string;

    @Column({ default: '' })
    otherInfo: string;

    @Column(() => IP)
    ip: IP;

    // 品牌
    @Column({ default: '' })
    brand: string;

    // 型号
    @Column({ default: '' })
    model: string;

    // 系统类型
    @Column({ default: '' })
    osType: string;

    @Column({ default: 'normal' })
    status: UserStatus;

    // 余额/次
    @Column({ default: 0 })
    balance: number;

    // 授权截止时间
    @Column({ default: () => 'NOW()' })
    expirationTime: Date;

    // 试用截止时间，此字段仅用于判断是否为试用用户，不做授权判断
    @Column({ default: () => 'NOW()' })
    trialExpiration: Date;

    // 最后登录时间 //为了确保表不会频繁更新 这里只保存天为单位
    @Column({ default: () => 'NOW()' })
    lastLoginTime: Date;

    shield = ['ip', 'ver'];
}
