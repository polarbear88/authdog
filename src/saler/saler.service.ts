import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPAddrAscriptionPlace } from 'src/common/dto/ipaddr-ascription-place';
import { PaginationUtils } from 'src/common/pagination/pagination.utils';
import { BaseService } from 'src/common/service/base.service';
import { CryptoUtils } from 'src/common/utils/crypyo.utils';
import { EntityUtils } from 'src/common/utils/entity.utils';
import { Repository } from 'typeorm';
import { CreateSalerByDevloperDto, GetSalerListDto } from './saler.dto';
import { Saler } from './saler.entity';

@Injectable()
export class SalerService extends BaseService {
    constructor(
        @InjectRepository(Saler)
        private repo: Repository<Saler>,
    ) {
        super(repo);
    }

    async updateDeveloperIAP(id: number, iap: IPAddrAscriptionPlace) {
        await this.repo.update(id, {
            ip: {
                country: iap.country,
                province: iap.region,
                city: iap.city,
                isp: iap.isp,
            },
        });
    }

    async existByName(developerId: number, name: string) {
        return await this.repo.exist({
            where: {
                developerId,
                name,
            },
        });
    }

    async existByMobile(developerId: number, mobile: string) {
        return await this.repo.exist({
            where: {
                developerId,
                mobile,
            },
        });
    }

    async createByDevloper(developerId: number, dto: CreateSalerByDevloperDto) {
        const saler = new Saler();
        saler.developerId = developerId;
        saler.name = dto.name;
        saler.mobile = dto.mobile;
        saler.rawPassword = dto.password;
        saler.salt = CryptoUtils.makeSalt();
        saler.password = CryptoUtils.encryptPassword(dto.password, saler.salt);
        saler.parentId = 0;
        saler.parentName = '开发者';
        saler.ip = {
            country: null,
            province: null,
            city: null,
            isp: null,
            ipv4: '127.0.0.1',
        };
        saler.balance = 0;
        saler.apps = [];
        return await this.repo.save(saler);
    }

    async getList(developerId: number, dto: GetSalerListDto, parentId?: number) {
        const where = [];
        where.push(['developerId = :developerId', { developerId }]);
        if (parentId) {
            where.push(['parentId = :parentId', { parentId }]);
        }
        const data = await super.getPage(PaginationUtils.objectToDto(dto, new GetSalerListDto()), where, 'id', 'DESC');
        return {
            total: data[1],
            list: EntityUtils.serializationEntityArr(data[0], true, ['ip']),
        };
    }
}
