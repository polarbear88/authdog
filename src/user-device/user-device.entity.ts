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
    developerId: number;

    @Index()
    @Column()
    appid: number;

    @Column()
    authMode: AppAuthMode;

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
}
