import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationUtils } from 'src/common/pagination/pagination.utils';
import { BaseService } from 'src/common/service/base.service';
import { RandomUtils } from 'src/common/utils/random.utils';
import { DeleteQueryBuilder, Repository, SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm';
import { RechargeCardType } from './card-type/recharge-card-type.entity';
import { ExportRechargeCardListDto, GetRechargeCardListDto } from './recharge-card.dto';
import { RechargeCard } from './recharge-card.entity';
import { RechargeCardStatus } from './recharge-card.type';

@Injectable()
export class RechargeCardService extends BaseService {
    constructor(
        @InjectRepository(RechargeCard)
        private rechargeCardRepository: Repository<RechargeCard>,
    ) {
        super(rechargeCardRepository);
    }

    async createRechargeCard(
        appid: number,
        rechargeCardType: RechargeCardType,
        description: string,
        creator: number,
        creatorName: string,
        count: number,
        createDetail = '开发者',
        mgr: Repository<RechargeCard> = this.rechargeCardRepository,
    ) {
        const rechargeCards = [];
        for (let i = 0; i < count; i++) {
            const rechargeCard = new RechargeCard();
            rechargeCard.appid = appid;
            rechargeCard.cardTypeId = rechargeCardType.id;
            rechargeCard.cardTypeName = rechargeCardType.name;
            rechargeCard.card = rechargeCardType.prefix + RandomUtils.getUUID().replace(/-/g, '');
            if (rechargeCardType.isNeedPassword) {
                rechargeCard.password = RandomUtils.getHexString(8);
            }
            if (description) {
                rechargeCard.description = description;
            }
            rechargeCard.time = rechargeCardType.time;
            rechargeCard.money = rechargeCardType.money;
            rechargeCard.status = 'unused';
            rechargeCard.price = rechargeCardType.price;
            rechargeCard.creator = creator;
            rechargeCard.creatorName = creatorName;
            rechargeCard.createDetail = createDetail;
            rechargeCards.push(rechargeCard);
        }
        return await mgr.save(rechargeCards);
    }

    async getListForDeveloper(appid: number, dto: GetRechargeCardListDto) {
        const data = await super.getPage(
            PaginationUtils.objectToDto(dto, new GetRechargeCardListDto()),
            [['appid = :appid', { appid }]],
            'id',
            'DESC',
        );
        return {
            total: data[1],
            list: data[0],
        };
    }

    async setStatusByIds(ids: Array<number>, status: RechargeCardStatus, whereCallback?: (query: UpdateQueryBuilder<RechargeCard>) => void) {
        const query = this.rechargeCardRepository
            .createQueryBuilder()
            .update()
            .set({ status, ver: () => 'ver + 1' })
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

    async rebuildCardByIds(ids: Array<number>, whereCallback?: (query: UpdateQueryBuilder<RechargeCard>) => void) {
        const query = this.rechargeCardRepository
            .createQueryBuilder()
            .update()
            .set({
                // card: () => "REPLACE(UUID(), '-', '')", // mysql的uuid基于时间戳，变化太小，不适合用于卡号
                card: () => 'LOWER(HEX(RANDOM_BYTES(16)))',
                password: () => "IF(LENGTH(password) > 0, LOWER(HEX(RANDOM_BYTES(4))), '')",
                ver: () => 'ver + 1',
            })
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

    async deleteByIds(ids: Array<number>, whereCallback?: (query: DeleteQueryBuilder<RechargeCard>) => void) {
        const query = this.rechargeCardRepository.createQueryBuilder().delete().where('id in (:...ids)', { ids });
        if (whereCallback) {
            whereCallback(query);
        }
        const result = await query.execute();
        if (result.affected > 0) {
            return result.affected;
        }
        throw new NotAcceptableException('操作失败');
    }

    async exportByIds(ids: Array<number>, whereCallback?: (query: SelectQueryBuilder<RechargeCard>) => void) {
        const query = this.rechargeCardRepository.createQueryBuilder().select(['card', 'password', 'cardTypeName']).where('id in (:...ids)', { ids });
        if (whereCallback) {
            whereCallback(query);
        }
        const arrs = await query.orderBy('id', 'DESC').execute();
        let str = '';
        for (const iterator of arrs) {
            str += `卡号：${iterator.card}`;
            if (iterator.password) {
                str += ` 密码：${iterator.password}`;
            }
            str += ` 类型：${iterator.cardTypeName}\n`;
        }
        if (!str) {
            throw new NotAcceptableException('没有可导出的数据');
        }
        return str;
    }

    async exportByEligible(appid: number, dto: ExportRechargeCardListDto) {
        const cldto = PaginationUtils.objectToDto(dto, new ExportRechargeCardListDto());
        const where = [['appid = :appid', { appid }]];
        const count = await this.getCount(cldto, where);
        if (count <= 0) {
            throw new NotAcceptableException('没有可导出的数据');
        }
        if (count > 2000) {
            throw new NotAcceptableException('数据量过大，无法导出[超出2000条]');
        }
        const data = await super.getAll(cldto, where, 'id', 'DESC');
        if (data[1] <= 0) {
            throw new NotAcceptableException('没有可导出的数据');
        }
        let str = '';
        for (const iterator of data[0]) {
            str += `卡号：${iterator.card}`;
            if (iterator.password) {
                str += ` 密码：${iterator.password}`;
            }
            str += ` 类型：${iterator.cardTypeName}\n`;
        }
        return str;
    }

    async setStatusByCards(
        appid: number,
        cards: Array<string>,
        status: RechargeCardStatus,
        whereCallback?: (query: UpdateQueryBuilder<RechargeCard>) => void,
    ) {
        const query = this.rechargeCardRepository
            .createQueryBuilder()
            .update()
            .set({ status, ver: () => 'ver + 1' })
            .where('card in (:...cards)', { cards })
            .andWhere('appid = :appid', { appid });
        if (whereCallback) {
            whereCallback(query);
        }
        const result = await query.execute();
        if (result.affected > 0) {
            return result.affected;
        }
        throw new NotAcceptableException('操作失败或没有找到数据');
    }

    async rebuildCardByCards(
        appid: number,
        cards: Array<string>,
        description: string,
        whereCallback?: (query: UpdateQueryBuilder<RechargeCard>) => void,
    ) {
        const query = this.rechargeCardRepository
            .createQueryBuilder()
            .update()
            .set({
                // card: () => "REPLACE(UUID(), '-', '')", // mysql的uuid基于时间戳，变化太小，不适合用于卡号
                card: () => 'LOWER(HEX(RANDOM_BYTES(16)))',
                password: () => "IF(LENGTH(password) > 0, LOWER(HEX(RANDOM_BYTES(4))), '')",
                description: description,
                ver: () => 'ver + 1',
            })
            .where('card in (:...cards)', { cards })
            .andWhere('appid = :appid', { appid });
        if (whereCallback) {
            whereCallback(query);
        }
        const result = await query.execute();
        if (result.affected > 0) {
            return result.affected;
        }
        throw new NotAcceptableException('操作失败或没有找到数据');
    }

    async deleteByCards(appid: number, cards: Array<string>, whereCallback?: (query: DeleteQueryBuilder<RechargeCard>) => void) {
        const query = this.rechargeCardRepository
            .createQueryBuilder()
            .delete()
            .where('card in (:...cards)', { cards })
            .andWhere('appid = :appid', { appid });
        if (whereCallback) {
            whereCallback(query);
        }
        const result = await query.execute();
        if (result.affected > 0) {
            return result.affected;
        }
        throw new NotAcceptableException('操作失败或没有找到数据');
    }

    async findByCard(appid: number, card: string) {
        return await this.rechargeCardRepository.findOne({ where: { appid, card } });
    }
}
