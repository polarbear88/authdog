import { BaseEntity } from 'src/common/entity/base.entity';
import { IP } from 'src/common/entity/ip.entity';
import { Column, Entity, Unique } from 'typeorm';
import { DeveloperStatus } from './developer.type';

@Unique(['name'])
@Unique(['mobile'])
@Entity()
export class Developer extends BaseEntity {
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
    status: DeveloperStatus;

    _serialization() {
        const data = super._serialization();
        return this.deleteConfidential(['password', 'salt', 'ip'], data);
    }
}
