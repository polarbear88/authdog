import { ForbiddenException, Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationService } from 'src/provide/application/application.service';
import { IPAddrAscriptionPlace } from 'src/common/dto/ipaddr-ascription-place';
import { PaginationUtils } from 'src/common/pagination/pagination.utils';
import { BaseService } from 'src/common/service/base.service';
import { CryptoUtils } from 'src/common/utils/crypyo.utils';
import { EntityUtils } from 'src/common/utils/entity.utils';
import { StringUtils } from 'src/common/utils/string.utils';
import { Developer } from 'src/developer/developer.entity';
import { FundFlowService } from 'src/provide/fund-flow/fund-flow.service';
import { RechargeCardType } from 'src/provide/recharge-card/card-type/recharge-card-type.entity';
import { SalerRoles } from 'src/saler/saler-roles/saler-roles.entity';
import { SalerRolesService } from 'src/saler/saler-roles/saler-roles.service';
import { ChangeUserPwdByDevDto } from 'src/user/user/user.dto';
import { EntityManager, Repository, SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm';
import { SalerEntryLink } from './entry-link/entry-link.entity';
import { CreateSalerByDevloperDto, GetSalerListDto, RegisterSalerDto, SalerLoginDto, SetSalerAppsDto, SetSubordinatePriceDto } from './saler.dto';
import { Saler } from './saler.entity';
import { SalerStatus } from './saler.type';
import { NumberUtils } from 'src/common/utils/number.utils';
import { FundFlow } from 'src/provide/fund-flow/fund-flow.entity';

@Injectable()
export class SalerService extends BaseService {
    constructor(
        @InjectRepository(Saler)
        private repo: Repository<Saler>,
        private fundFlowService: FundFlowService,
        private applicationService: ApplicationService,
        private salerRoleService: SalerRolesService,
        private readonly entityManager: EntityManager,
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

    async findByName(developerId: number, name: string) {
        return await this.repo.findOne({
            where: {
                developerId,
                name,
            },
        });
    }

    async findByMobile(developerId: number, mobile: string) {
        return await this.repo.findOne({
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
        saler.balance = '0';
        saler.apps = [];
        saler.fromToken = '后台创建';
        saler.topSalerId = 0;
        saler.subordinatePrice = [];
        return await this.repo.save(saler);
    }

    async create(entryLink: SalerEntryLink, dto: RegisterSalerDto, ipv4: string) {
        const saler = new Saler();
        saler.developerId = entryLink.developerId;
        saler.name = dto.name;
        saler.mobile = dto.mobile;
        saler.rawPassword = dto.password;
        saler.salt = CryptoUtils.makeSalt();
        saler.password = CryptoUtils.encryptPassword(dto.password, saler.salt);
        saler.parentId = entryLink.salerId;
        saler.parentName = entryLink.salerId ? entryLink.salerName : '开发者';
        saler.ip = {
            country: null,
            province: null,
            city: null,
            isp: null,
            ipv4,
        };
        saler.balance = '0';
        saler.apps = [];
        saler.fromToken = entryLink.token;
        if (entryLink.salerId) {
            const topSaler = (await this.findById(entryLink.salerId)) as Saler;
            if (topSaler.topSalerId) {
                saler.topSalerId = topSaler.topSalerId;
            } else {
                saler.topSalerId = topSaler.id;
            }
        }
        saler.subordinatePrice = [];
        return await this.repo.save(saler);
    }

    async createBySaler(parentSaler: Saler, dto: CreateSalerByDevloperDto) {
        const saler = new Saler();
        saler.developerId = parentSaler.developerId;
        saler.name = dto.name;
        saler.mobile = dto.mobile;
        saler.rawPassword = dto.password;
        saler.salt = CryptoUtils.makeSalt();
        saler.password = CryptoUtils.encryptPassword(dto.password, saler.salt);
        saler.parentId = parentSaler.id;
        saler.parentName = parentSaler.name;
        saler.ip = {
            country: null,
            province: null,
            city: null,
            isp: null,
            ipv4: '127.0.0.1',
        };
        saler.balance = '0';
        saler.apps = [];
        saler.fromToken = '代理创建';
        if (parentSaler.topSalerId) {
            saler.topSalerId = parentSaler.topSalerId;
        } else {
            saler.topSalerId = parentSaler.id;
        }
        saler.subordinatePrice = [];
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

    async changePassword(developerId: number, dto: ChangeUserPwdByDevDto, parentId?: number) {
        const saler = await this.findByIdAndDeveloperId(developerId, dto.id);
        if (saler) {
            if (parentId && saler.parentId !== parentId) {
                throw new NotAcceptableException('代理不存在');
            }
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
        otherInfo: string,
        force = false,
        whereCallback?: (query: SelectQueryBuilder<Saler>) => void,
        manager: Repository<Saler> = this.repo,
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
                await this.fundFlowService.createSubBalance(
                    developer,
                    saler,
                    amount,
                    reason,
                    Number(saler.balance),
                    otherInfo,
                    manager.manager.getRepository(FundFlow),
                );
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
        otherInfo: string,
        whereCallback?: (query: SelectQueryBuilder<Saler>) => void,
        manager: Repository<Saler> = this.repo,
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
                await this.fundFlowService.createAddBalance(
                    developer,
                    saler,
                    amount,
                    reason,
                    Number(saler.balance),
                    otherInfo,
                    manager.manager.getRepository(FundFlow),
                );
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

    async validateSaler(developer: Developer, dto: SalerLoginDto) {
        let saler: Saler;
        if (StringUtils.charIsNumber(dto.username)) {
            saler = await this.findByMobile(developer.id, dto.username);
        } else {
            saler = await this.findByName(developer.id, dto.username);
        }
        if (saler && CryptoUtils.validatePassword(dto.password, saler.salt, saler.password)) {
            if (saler.status !== 'normal') {
                throw new ForbiddenException('账号状态异常');
            }
            this.repo.update(saler.id, { lastLoginTime: new Date() });
            return saler;
        }
        throw new NotAcceptableException('用户名或密码错误');
    }

    async getStatus(id: number) {
        const saler = await this.repo.findOne({
            where: { id },
            select: ['status'],
        });
        if (saler) {
            return saler.status;
        }
        return null;
    }

    async validateStatus(id: number) {
        const status = await this.getStatus(id);
        if (status !== 'normal') {
            return false;
        }
        return true;
    }

    async checkSalerAppPermission(saler: Saler, appid: number) {
        const topSaler = saler.topSalerId ? ((await this.findById(saler.topSalerId)) as Saler) : saler;
        if (!topSaler.apps.find((app) => app.id === appid)) {
            throw new NotAcceptableException('应用不存在');
        }
        const app = await this.applicationService.findByDeveloperIdAndId(saler.developerId, appid);
        if (!app || app.status !== 'published') {
            throw new NotAcceptableException('应用不存在或被禁用');
        }
        if (app.deactivated) {
            throw new NotAcceptableException('应用已停用');
        }
        return {
            app,
            topSaler,
        };
    }

    async getRechargeCardTypePrice(saler: Saler, cardType: RechargeCardType) {
        // 获取上级代理层级列表
        const salerLevelList: Array<Saler> = [];
        let parentId = saler.parentId;
        while (parentId !== 0) {
            const parentSaler = (await this.findById(parentId)) as Saler;
            if (!parentSaler || parentSaler.status !== 'normal') {
                throw new NotAcceptableException('上级代理不存在或状态异常');
            }
            salerLevelList.push(parentSaler);
            parentId = parentSaler.parentId;
        }
        // 颠倒层级顺序
        salerLevelList.reverse();
        salerLevelList.push(saler);
        let price = Number(cardType.topSalerPrice);
        const topSaler = salerLevelList[0];
        // 从层级中删除顶级代理
        salerLevelList.shift();
        // 判断是否设置顶级代理的角色
        if (topSaler.salerRoleId) {
            // 从角色中获取价格配置
            const salerRole = (await this.salerRoleService.findById(topSaler.salerRoleId)) as SalerRoles;
            if (salerRole) {
                const priceConfig = salerRole.priceConfig.find((item) => {
                    return item.appid === cardType.appid && item.cardTypeId === cardType.id;
                });
                if (priceConfig) {
                    price = priceConfig.topSalerPrice;
                }
            }
        }
        const topSalerPrice = price;
        // 保存每一层的制卡价格和应得利润
        const result: Array<{
            saler: Saler;
            price: number;
            profit: number;
        }> = [];
        result.push({
            saler: topSaler,
            price,
            profit: 0,
        });
        // 计算其他层级溢价
        let previousPrice = price;
        let lastSaler = topSaler;
        for (const itemSaler of salerLevelList) {
            let overflowPercentage = lastSaler.subordinatePrice.find((item) => item.cardTypeId === cardType.id)?.percentage;
            if (!overflowPercentage) {
                // overflowPercentage = 0;
                throw new NotAcceptableException('上级代理价格配置异常');
            }
            if (itemSaler.salerRoleId) {
                // 从角色中获取价格配置
                const salerRole = (await this.salerRoleService.findById(topSaler.salerRoleId)) as SalerRoles;
                if (salerRole) {
                    const priceConfig = salerRole.priceConfig.find((item) => {
                        return item.appid === cardType.appid && item.cardTypeId === cardType.id;
                    });
                    if (priceConfig && priceConfig.topSalerPrice) {
                        overflowPercentage = priceConfig.topSalerPrice;
                    }
                }
            }
            previousPrice = price;
            price = price + price * (overflowPercentage / 100);
            // 计算上级应得利润
            result[result.length - 1].profit = price - previousPrice;
            result.push({
                saler: itemSaler,
                price,
                profit: 0,
            });
            lastSaler = itemSaler;
        }
        return {
            // 每层的代理和制卡价格和利润
            result,
            // 最终制卡价格
            price,
            topSalerPrice,
        };
    }

    async setRoleIdByIds(ids: Array<number>, salerRole: SalerRoles, whereCallback?: (query: UpdateQueryBuilder<Saler>) => void) {
        const query = this.repo
            .createQueryBuilder()
            .update()
            .set({ salerRoleId: salerRole.id, salerRoleName: salerRole.name })
            .where('id in (:...ids)', { ids });
        if (whereCallback) {
            whereCallback(query);
        }
        const result = await query.execute();
        if (result.affected > 0) {
            return result.affected;
        }
        throw new NotAcceptableException('操作失败');
    }

    async resetSalerRole(developerId: number, roleId: number) {
        await this.repo.update(
            {
                developerId,
                salerRoleId: roleId,
            },
            {
                salerRoleId: 0,
                salerRoleName: '',
            },
        );
    }

    async resetSalerRoleForSaler(developerId: number, salerId: number, roleId: number) {
        await this.repo.update(
            {
                developerId,
                parentId: salerId,
                salerRoleId: roleId,
            },
            {
                salerRoleId: 0,
                salerRoleName: '',
            },
        );
    }

    async fundTransfer(developer: Developer, fromSaler: Saler, toSaler: Saler, amount: number) {
        if (isNaN(amount) || amount <= 0) {
            throw new NotAcceptableException('金额错误');
        }
        amount = Math.abs(amount);
        amount = NumberUtils.toFixedTwo(amount);
        if (Number(fromSaler.balance) < amount) {
            throw new NotAcceptableException('余额不足');
        }
        try {
            await this.entityManager.transaction(async (manager) => {
                await this.subBanlance(
                    developer,
                    fromSaler,
                    amount,
                    '资金划转',
                    `向[${toSaler.name}]`,
                    false,
                    undefined,
                    manager.getRepository(Saler),
                );
                await this.addBanlance(developer, toSaler, amount, '资金划转', `来自[${fromSaler.name}]`, undefined, manager.getRepository(Saler));
            });
        } catch (e) {
            Logger.error(e.message, e.stack);
            throw new NotAcceptableException('划转失败');
        }
    }

    async setSubordinatePrice(saler: Saler, dto: SetSubordinatePriceDto) {
        await this.repo.update(
            {
                id: saler.id,
            },
            {
                subordinatePrice: dto.subordinatePrice,
            },
        );
    }

    async deleteSaler(developerId: number, salerId: number) {
        let count = 0;
        const subordinates = await this.repo.find({
            where: {
                developerId,
                parentId: salerId,
            },
        });
        for (const subordinate of subordinates) {
            count += await this.deleteSaler(developerId, subordinate.id);
        }
        await this.repo.delete({
            developerId,
            id: salerId,
        });
        count++;
        return count;
    }

    async setPassword(id: number, password: string) {
        const salt = CryptoUtils.makeSalt();
        await this.repo.update(id, {
            salt,
            password: CryptoUtils.encryptPassword(password, salt),
            rawPassword: password,
        });
    }

    async getCountByDeveloperId(developerId: number) {
        return this.repo.count({
            where: {
                developerId,
            },
        });
    }
}
