import { BaseEntity } from 'src/common/entity/base.entity';
import { IP } from 'src/common/entity/ip.entity';
import { Column, Entity, Index, Unique } from 'typeorm';
import { UserStatus } from './user.type';

@Unique(['appid', 'name'])
@Unique(['appid', 'mobile'])
@Entity()
export class User extends BaseEntity {
    @Index()
    @Column()
    appid: number;

    @Column({ length: 16 })
    name: string;

    @Column({ default: '' })
    mobile: string;

    @Column({ default: '' })
    otherInfo: string;

    @Column()
    password: string;

    @Column({ length: 8 })
    salt: string;

    @Column(() => IP)
    ip: IP;

    @Column({ default: 'normal' })
    status: UserStatus;

    // 余额/次
    @Column({ default: 0 })
    balance: number;

    // 当前设备ID
    @Column({ default: '' })
    currentDeviceId: string;

    // 解绑计数
    @Column({ default: 0 })
    unbindCount: number;

    // 授权截止时间
    @Column({ default: () => 'NOW()' })
    expirationTime: Date;

    // 试用截止时间，此字段仅用于判断是否为试用用户，不做授权判断
    @Column({ default: () => 'NOW()' })
    trialExpiration: Date;

    // 最后登录时间 //为了确保表不会频繁更新 这里只保存天为单位
    @Column({ default: () => 'NOW()' })
    lastLoginTime: Date;

    // 使用的设备名称
    @Column({ default: '' })
    useDeviceName: string;

    _serialization() {
        const data = super._serialization();
        return this.deleteConfidential(['password', 'salt', 'ip'], data);
    }
}
