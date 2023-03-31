import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPAddrAscriptionPlace } from 'src/common/dto/ipaddr-ascription-place';
import { PaginationUtils } from 'src/common/pagination/pagination.utils';
import { BaseService } from 'src/common/service/base.service';
import { CryptoUtils } from 'src/common/utils/crypyo.utils';
import { EntityUtils } from 'src/common/utils/entity.utils';
import { Developer } from 'src/developer/developer.entity';
import { FundFlowService } from 'src/fund-flow/fund-flow.service';
import { ChangeUserPwdByDevDto } from 'src/user/user.dto';
import { Repository, SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm';
import { CreateSalerByDevloperDto, GetSalerListDto, SetSalerAppsDto } from './saler.dto';
import { Saler } from './saler.entity';
import { SalerStatus } from './saler.type';

@Injectable()
export class SalerService extends BaseService {
    constructor(
        @InjectRepository(Saler)
        private repo: Repository<Saler>,
        private fundFlowService: FundFlowService,
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

    async findByIdAndDeveloperId(developerId: number, id: number) {
        return await this.repo.findOne({
            where: {
                id,
                developerId,
            },
        });
    }

    async changePasswordByDev(developerId: number, dto: ChangeUserPwdByDevDto) {
        const saler = await this.findByIdAndDeveloperId(developerId, dto.id);
        if (saler) {
            const salt = CryptoUtils.makeSalt();
            const password = CryptoUtils.encryptPassword(dto.password, salt);
            await this.repo.update(saler.id, { salt, password, rawPassword: dto.password });
            return saler;
        }
        throw new NotAcceptableException('代理不存在');
    }

    async setStatusByIds(ids: Array<number>, status: SalerStatus, whereCallback?: (query: UpdateQueryBuilder<Saler>) => void) {
        const query = this.repo.createQueryBuilder().update().set({ status }).where('id in (:...ids)', { ids });
        if (whereCallback) {
            whereCallback(query);
        }
        const result = await query.execute();
        if (result.affected > 0) {
            return result.affected;
        }
        throw new NotAcceptableException('操作失败');
    }

    async subBanlance(
        developer: Developer,
        saler: Saler | Array<number>,
        amount: number,
        reason: string,
        force = false,
        whereCallback?: (query: SelectQueryBuilder<Saler>) => void,
        manager?: Repository<Saler>,
    ) {
        const mgr = manager || this.repo;
        const query = mgr.createQueryBuilder();
        if (Array.isArray(saler)) {
            query.where('id in (:...ids)', { ids: saler });
        } else {
            query.where('id = :id', { id: saler.id }).andWhere('ver = :ver', { ver: saler.ver });
        }
        if (!force) {
            query.andWhere(`balance >= ${amount}`);
        }
        query.andWhere('developerId = :developerId', { developerId: developer.id });
        if (whereCallback) {
            whereCallback(query);
        }
        const affected = await query
            .update({
                balance: () => `GREATEST(balance - ${amount}, 0)`,
                ver: () => 'ver + 1',
            })
            .execute();
        if (affected.affected > 0) {
            if (!Array.isArray(saler)) {
                await this.fundFlowService.createSubBalance(developer, saler, amount, reason, saler.balance);
            }
            return affected.affected;
        }
        throw new NotAcceptableException('操作失败，可能余额不足');
    }

    async addBanlance(
        developer: Developer,
        saler: Saler | Array<number>,
        amount: number,
        reason: string,
        whereCallback?: (query: SelectQueryBuilder<Saler>) => void,
        manager?: Repository<Saler>,
    ) {
        const mgr = manager || this.repo;
        const query = mgr.createQueryBuilder();
        if (Array.isArray(saler)) {
            query.where('id in (:...ids)', { ids: saler });
        } else {
            query.where('id = :id', { id: saler.id }).andWhere('ver = :ver', { ver: saler.ver });
        }
        query.andWhere('developerId = :developerId', { developerId: developer.id });
        if (whereCallback) {
            whereCallback(query);
        }
        const affected = await query
            .update({
                balance: () => `balance + ${amount}`,
                ver: () => 'ver + 1',
            })
            .execute();
        if (affected.affected > 0) {
            if (!Array.isArray(saler)) {
                await this.fundFlowService.createAddBalance(developer, saler, amount, reason, saler.balance);
            }
            return affected.affected;
        }
        throw new NotAcceptableException('操作失败');
    }

    async setApps(developerId: number, dto: SetSalerAppsDto) {
        const saler = await this.findByIdAndDeveloperId(developerId, dto.id);
        if (saler) {
            saler.apps = dto.apps;
            return await this.repo.save(saler);
        }
        throw new NotAcceptableException('代理不存在');
    }
}
