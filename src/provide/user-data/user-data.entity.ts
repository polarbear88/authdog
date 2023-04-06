import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index, Unique } from 'typeorm';

@Index(['appid', 'userName'])
@Index(['appid', 'userId'])
@Index(['appid', 'name'])
@Unique(['appid', 'uniqueValue'])
@Entity()
export class UserData extends BaseEntity {
    @Index()
    @Column()
    developerId: number;

    @Index()
    @Column()
    appid: number;

    @Column()
    appName: string;

    @Column()
    userId: number;

    @Column()
    userName: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    value: string;

    @Column({ nullable: true })
    uniqueValue: string;

    serialization_user() {
        return {
            id: this.id,
            name: this.name,
            value: this.value,
            uniqueValue: this.uniqueValue,
        };
    }
}
