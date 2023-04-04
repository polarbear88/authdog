import { Column, CreateDateColumn, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { DateUtils } from '../utils/date.utils';

export class BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ default: 0, type: 'bigint' })
    ver: number;

    // convertDateToTimeStamp() {
    //     DateUtils.convertDatesToTimestamps(this);
    // }

    _unShield(unShieldNames: Array<string>, data: Array<string>) {
        unShieldNames.forEach((name) => {
            const index = data.indexOf(name);
            if (index > -1) {
                data.splice(index, 1);
            }
        });
        return data;
    }

    _deleteConfidential(names: string[], data: any) {
        names.forEach((name) => delete data[name]);
        return data;
    }

    _serialization(unShieldNames: Array<string> = []) {
        if (!(this as any).shield) {
            return this;
        }
        (this as any).shield.push('shield');
        const data = DateUtils.convertDatesToTimestamps({ ...this });
        return this._deleteConfidential(this._unShield(unShieldNames, (this as any).shield), data);
    }

    // 不用复制对象，速度更快
    _serializationThis(unShieldNames: Array<string> = []) {
        if (!(this as any).shield) {
            return this;
        }
        (this as any).shield.push('shield');
        const data = DateUtils.convertDatesToTimestamps(this);
        return this._deleteConfidential(this._unShield(unShieldNames, (this as any).shield), data);
    }
}
