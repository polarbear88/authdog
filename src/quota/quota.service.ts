import { InjectRepository } from '@nestjs/typeorm';
import { Quota } from './quota.entity';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/service/base.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuotaService extends BaseService {
    constructor(
        @InjectRepository(Quota)
        private repo: Repository<Quota>,
    ) {
        super(repo);
    }

    async getByName(name: string) {
        return this.repo.findOne({ where: { name } });
    }
}
