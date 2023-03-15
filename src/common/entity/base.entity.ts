import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export class BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    _serialization() {
        return { ...this };
    }

    deleteConfidential(names: string[], data: any) {
        names.forEach((name) => delete data[name]);
        return data;
    }
}
