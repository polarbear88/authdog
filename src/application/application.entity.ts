import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Unique } from 'typeorm';
import { AppAuthMode, AppCryptoMode, AppStatus } from './application.type';

@Unique(['developerId', 'name'])
@Entity()
export class Application extends BaseEntity {
    @Column()
    developerId: number;

    @Column({ length: 32 })
    name: string;

    @Column()
    version: string;

    // 状态
    @Column({ default: 'published' })
    status: AppStatus;

    // 是否强制升级
    @Column({ default: false })
    forceUpgrade: boolean;

    // 新版本下载地址
    @Column({ type: 'text', nullable: true })
    downloadUrl: string;

    // 通知
    @Column({ type: 'text', nullable: true })
    notice: string;

    // 加密模式
    @Column({ length: 8 })
    cryptoMode: AppCryptoMode;

    // 加密私钥 如果是aes模式，这里存的是aes密钥
    @Column({ type: 'text', nullable: true })
    cryptoSecret: string;

    // 加密公钥
    @Column({ type: 'text', nullable: true })
    cryptoPublicKey: string;

    // 试用时间 单位：分钟 0表示不允许试用
    @Column({ default: 0 })
    trialTime: number;

    // 授权模式
    @Column({ length: 10 })
    authMode: AppAuthMode;

    // 是否免费 免费后不需要授权 但是需要登录
    @Column({ default: false })
    free: boolean;

    // 是否绑定机器码 绑定后只能在绑定的机器上使用
    @Column({ default: false })
    bindDevice: boolean;

    // 是否允许解绑
    @Column({ default: false })
    allowUnbind: boolean;

    // 解绑一次扣时间 单位：分钟
    @Column({ default: 0 })
    unbindDeductTime: number;

    // 解绑一次扣次数
    @Column({ default: 0 })
    unbindDeductCount: number;

    // 最大解绑次数
    @Column({ default: 0 })
    maxUnbindCount: number;

    // 如果在用户模式下且不绑定机器码是否允许多设备登录
    @Column({ default: false })
    allowMultiDevice: boolean;

    // 如果允许多设备登录，最大同时登录设备数
    @Column({ default: 0 })
    maxMultiDevice: number;

    // 是否使用按次模式
    @Column({ default: false })
    useCountMode: boolean;

    // 次数用尽是否允许登录
    @Column({ default: true })
    allowLoginWhenCountUsedUp: boolean;

    // 试用次数
    @Column({ default: 0 })
    trialCount: number;
}
