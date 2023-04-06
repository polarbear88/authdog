import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service/base.service';
import { RandomUtils } from 'src/common/utils/random.utils';
import { Repository } from 'typeorm';
import { SalerEntryLink } from './entry-link.entity';

@Injectable()
export class SalerEntryLinkService extends BaseService {
    constructor(
        @InjectRepository(SalerEntryLink)
        private repo: Repository<SalerEntryLink>,
    ) {
        super(repo);
    }

    async findByToken(token: string) {
        return await this.repo.findOne({ where: { token } });
    }

    async getList(developerId: number, salerId?: number) {
        if (!salerId) {
            salerId = 0;
        }
        return await this.repo.find({
            where: {
                developerId,
                salerId,
            },
        });
    }

    async create(developerId: number, salerId: number, type: 'login' | 'register', name: string, salerName?: string) {
        const token = this.generateToken();
        const link = new SalerEntryLink();
        link.developerId = developerId;
        link.salerId = salerId;
        link.type = type;
        link.token = token;
        link.name = name;
        link.salerName = salerName || '';
        return await this.repo.save(link);
    }

    async delete(developerId: number, salerId: number, token: string) {
        return await this.repo.delete({
            developerId,
            salerId,
            token,
        });
    }

    generateToken() {
        return RandomUtils.getLetterNumber(8);
    }
}
