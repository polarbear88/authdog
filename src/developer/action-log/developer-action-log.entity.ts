import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Index(['developerId', 'action'])
@Entity()
export class DeveloperActionLog extends BaseEntity {
    @Index()
    @Column()
    developerId: number;

    @Column({ default: '' })
    username: string;

    @Column()
    action: string;

    @Column({ default: 0 })
    appid: number;

    @Column({ default: '' })
    appname: string;

    @Column()
    ip: string;

    @Column({ type: 'text' })
    url: string;

    @Column()
    method: string;

    // 该操作对某个数据的影响，比如删除了某个用户 此处就是用户的id
    @Column({ type: 'text', nullable: true })
    affected: string;
}
