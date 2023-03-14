import { Repository, BaseEntity } from 'typeorm';

export class BaseService {
    constructor(private repository: Repository<unknown>) {
        this.repository = repository;
    }
}
