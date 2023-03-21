// 此表仅用于记录用户所使用的设备信息，用于统计用户使用设备的情况
import { AppAuthMode } from 'src/application/application.type';
import { BaseEntity } from 'src/common/entity/base.entity';
import { IP } from 'src/common/entity/ip.entity';
import { Column, Entity, Index, Unique } from 'typeorm';

@Unique(['appid', 'deviceId'])
@Entity()
export class UserDevice extends BaseEntity {
    @Index()
    @Column()
    develoeprId: number;

    @Index()
    @Column()
    appid: number;

    @Column()
    authMode: AppAuthMode;

    @Column({ nullable: true })
    userId: number;

    // 对应device表的id
    @Column({ nullable: true })
    did: string;

    // 品牌
    @Column({ default: '' })
    brand: string;

    // 型号
    @Column({ default: '' })
    model: string;

    // 系统类型
    @Column({ default: '' })
    osType: string;

    // 设备ID
    @Column()
    deviceId: string;

    @Column(() => IP)
    ip: IP;

    // 最后使用
    @Column({ default: () => 'NOW()' })
    lastUseTime: Date;
}
