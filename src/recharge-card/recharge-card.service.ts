import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service/base.service';
import { StringUtils } from 'src/common/utils/string.utils';
import { Repository } from 'typeorm';
import { RechargeCardType } from './card-type/recharge-card-type.entity';
import { RechargeCard } from './recharge-card.entity';

@Injectable()
export class RechargeCardService extends BaseService {
    constructor(
        @InjectRepository(RechargeCard)
        private rechargeCardRepository: Repository<RechargeCard>,
    ) {
        super(rechargeCardRepository);
    }

    async createRechargeCard(appid: number, rechargeCardType: RechargeCardType, desc: string, creator: number, creatorName: string, count: number) {
        const rechargeCards = [];
        for (let i = 0; i < count; i++) {
            const rechargeCard = new RechargeCard();
            rechargeCard.appid = appid;
            rechargeCard.cardTypeId = rechargeCardType.id;
            rechargeCard.cardTypeName = rechargeCardType.name;
            rechargeCard.card = StringUtils.buildFormatString(rechargeCardType.cardFormat).str;
            if (rechargeCardType.isNeedPassword) {
                rechargeCard.password = StringUtils.buildFormatString(rechargeCardType.passwordFormat).str;
            }
            if (desc) {
                rechargeCard.desc = desc;
            }
            rechargeCard.time = rechargeCardType.time;
            rechargeCard.money = rechargeCardType.money;
            rechargeCard.status = 'unused';
            rechargeCard.price = rechargeCardType.price;
            rechargeCard.creator = creator;
            rechargeCard.creatorName = creatorName;
            rechargeCard.createDetail = 'developer';
            rechargeCards.push(rechargeCard);
        }
        return await this.rechargeCardRepository.save(rechargeCards);
    }
}
