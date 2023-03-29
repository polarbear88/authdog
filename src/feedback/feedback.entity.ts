import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index } from 'typeorm';
import { FeedbackStatus } from './feedback.type';

@Index(['appid', 'userName'])
@Entity()
export class Feedback extends BaseEntity {
    @Index()
    @Column()
    appid: number;

    @Column()
    appVersion: string;

    // 用户名
    @Column()
    userName: string;

    // 设备ID
    @Column()
    deviceId: string;

    // 品牌
    @Column({ default: '' })
    brand: string;

    // 型号
    @Column({ default: '' })
    model: string;

    // 系统类型
    @Column({ default: '' })
    osType: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ default: 'pending' })
    status: FeedbackStatus;
}
