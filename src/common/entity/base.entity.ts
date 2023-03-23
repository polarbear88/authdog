import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { DateUtils } from '../utils/date.utils';

export class BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ default: 0, type: 'bigint' })
    ver: number;

    _serialization() {
        return DateUtils.convertDatesToTimestamps({ ...this });
    }

    // 不用复制对象，速度更快
    _serializationThis() {
        return DateUtils.convertDatesToTimestamps(this);
    }

    // convertDateToTimeStamp() {
    //     DateUtils.convertDatesToTimestamps(this);
    // }

    deleteConfidential(names: string[], data: any) {
        names.forEach((name) => delete data[name]);
        return data;
    }
}
