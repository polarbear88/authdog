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

    async getPage(dto: any, where?: Array<Array<any>>, sort?: string, order?: 'ASC' | 'DESC') {
        return await this.getQuery(dto, where, sort, order).getManyAndCount();
    }

    getQuery(dto: any, where?: Array<Array<any>>, sort?: string, order?: 'ASC' | 'DESC') {
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
        if (order) {
            query.orderBy(sort, order);
        }
        return PaginationUtils.build(query, dto, isNotFirst);
    }

    getAllQuery(dto: any, where?: Array<Array<any>>, sort?: string, order?: 'ASC' | 'DESC') {
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
        if (order) {
            query.orderBy(sort, order);
        }
        return PaginationUtils.build(query, dto, isNotFirst, false);
    }

    async getAll(dto: any, where?: Array<Array<any>>, sort?: string, order?: 'ASC' | 'DESC') {
        return await this.getAllQuery(dto, where, sort, order).getManyAndCount();
    }

    async getCount(dto: any, where?: Array<Array<any>>) {
        return await this.getAllQuery(dto, where).getCount();
    }

    async count(where: any) {
        return await this.repository.count({ where });
    }

    getRepo() {
        return this.repository;
    }
}
