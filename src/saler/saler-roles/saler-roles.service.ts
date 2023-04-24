import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service/base.service';
import { Repository } from 'typeorm';
import { SalerRoles } from './saler-roles.entity';

@Injectable()
export class SalerRolesService extends BaseService {
    constructor(
        @InjectRepository(SalerRoles)
        private repo: Repository<SalerRoles>,
    ) {
        super(repo);
    }

    async getList(developerId: number, salerId: number) {
        return await this.repo.find({
            where: {
                developerId,
                salerId,
            },
        });
    }

    async create(developerId: number, name: string, salerId: number) {
        const salerRole = new SalerRoles();
        salerRole.developerId = developerId;
        salerRole.name = name;
        salerRole.priceConfig = [];
        salerRole.salerId = salerId;
        return await this.repo.save(salerRole);
    }

    async setPriceConfig(id: number, priceConfig: SalerRoles['priceConfig']) {
        priceConfig.map((item) => {
            item.topSalerPrice = Number(item.topSalerPrice.toFixed(2));
            return item;
        });
        return await this.repo.update(id, { priceConfig });
    }

    async findByDeveloperAndId(developerId: number, id: number, salerId: number) {
        return await this.repo.findOne({
            where: {
                developerId,
                id,
                salerId,
            },
        });
    }

    async delete(id: number) {
        return await this.repo.delete(id);
    }
}
