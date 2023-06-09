import { Injectable, NotAcceptableException } from '@nestjs/common';
import { NumberUtils } from 'src/common/utils/number.utils';
import { Developer } from 'src/developer/developer.entity';
import { DeveloperService } from 'src/developer/developer.service';
import { FundFlow } from 'src/provide/fund-flow/fund-flow.entity';
import { FundFlowService } from 'src/provide/fund-flow/fund-flow.service';
import { RechargeCardType } from 'src/provide/recharge-card/card-type/recharge-card-type.entity';
import { SalerCreateRechargeCardDto } from 'src/provide/recharge-card/recharge-card.dto';
import { RechargeCard } from 'src/provide/recharge-card/recharge-card.entity';
import { RechargeCardService } from 'src/provide/recharge-card/recharge-card.service';
import { Saler } from 'src/saler/saler/saler.entity';
import { SalerService } from 'src/saler/saler/saler.service';
import { EntityManager } from 'typeorm';

@Injectable()
export class SalerControlService {
    constructor(
        private salerService: SalerService,
        private developerService: DeveloperService,
        private readonly entityManager: EntityManager,
        private rechargeService: RechargeCardService,
        private fundFlowService: FundFlowService,
    ) {}

    async createRechargeCardBySaler(dto: SalerCreateRechargeCardDto, saler: Saler, cardType: RechargeCardType) {
        // 计算价格
        const priceResult = await this.salerService.getRechargeCardTypePrice(saler, cardType);
        if (Number(saler.balance) < priceResult.price * dto.count) {
            throw new NotAcceptableException('余额不足');
        }
        const developer = (await this.developerService.findById(saler.developerId)) as Developer;
        if (!developer) {
            throw new NotAcceptableException('开发者不存在');
        }
        const createDetail = priceResult.result
            .map((item) => {
                return `${item.saler.name}：单价${item.price} 利润${item.profit}`;
            })
            .join(';');
        try {
            let cards: RechargeCard[] = [];
            await this.entityManager.transaction(async (manager) => {
                // 先扣钱再说
                await this.salerService.subBanlance(
                    developer,
                    saler,
                    NumberUtils.toFixedTwo(priceResult.price * dto.count),
                    '制作充值卡',
                    `[${cardType.name}${dto.count}张]`,
                    false,
                    undefined,
                    manager.getRepository(Saler),
                );
                // 为每层代理加钱
                // 不处理最后一层代理 因为是他在制作充值卡
                for (let i = 0; i < priceResult.result.length - 1; i++) {
                    const item = priceResult.result[i];
                    await this.salerService.addBanlance(
                        developer,
                        item.saler,
                        NumberUtils.toFixedTwo(item.profit * dto.count),
                        `制作充值卡`,
                        `下级[${priceResult.result[i + 1].saler.name}][${cardType.name}${dto.count}张]`,
                        undefined,
                        manager.getRepository(Saler),
                    );
                }
                // 为开发者写入明细
                await this.fundFlowService.createAddBalance(
                    developer,
                    null,
                    NumberUtils.toFixedTwo(priceResult.topSalerPrice * dto.count),
                    `制作充值卡`,
                    0,
                    `[${saler.name}]${cardType.name}${dto.count}张`,
                    manager.getRepository(FundFlow),
                );
                // 生成充值卡
                cards = await this.rechargeService.createRechargeCard(
                    developer.id,
                    dto.appid,
                    cardType,
                    dto.description,
                    saler.id,
                    saler.name,
                    dto.count,
                    priceResult.price.toFixed(2),
                    createDetail,
                    manager.getRepository(RechargeCard),
                );
            });
            return cards;
        } catch (error) {
            throw new NotAcceptableException('系统错误，请稍后再试');
        }
    }
}
