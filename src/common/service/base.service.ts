import { Repository } from 'typeorm';
import { BaseEntity } from '../entity/base.entity';

export class BaseService {
    constructor(private repository: Repository<BaseEntity>) {
        this.repository = repository;
    }

    async findById(id: number) {
        return this.repository.findOne({ where: { id } });
    }
}
