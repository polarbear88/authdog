import { Repository } from 'typeorm';
import { BaseEntity } from '../entity/base.entity';
import { PaginationUtils } from '../pagination/pagination.utils';

export class BaseService {
    constructor(private repository: Repository<BaseEntity>) {
        this.repository = repository;
    }

    async findById(id: number) {
        return this.repository.findOne({ where: { id } });
    }

    async getPage(dto: any, where?: Array<Array<any>>) {
        const query = this.repository.createQueryBuilder();
        let isNotFirst = false;
        if (where && where.length > 0) {
            for (const item of where) {
                if (isNotFirst) {
                    query.andWhere(item[0], item[1]);
                } else {
                    query.where(item[0], item[1]);
                    isNotFirst = true;
                }
            }
        }
        return await PaginationUtils.build(query, dto, isNotFirst).getManyAndCount();
    }
}
