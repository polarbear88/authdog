import { Injectable, NotAcceptableException } from '@nestjs/common';
import { Developer } from 'src/developer/developer.entity';
import { DeveloperService } from 'src/developer/developer.service';
import { RechargeCardType } from 'src/recharge-card/card-type/recharge-card-type.entity';
import { SalerCreateRechargeCardDto } from 'src/recharge-card/recharge-card.dto';
import { RechargeCardService } from 'src/recharge-card/recharge-card.service';
import { Saler } from 'src/saler/saler.entity';
import { SalerService } from 'src/saler/saler.service';
import { EntityManager } from 'typeorm';

@Injectable()
export class SalerControlService {
    constructor(
        private salerService: SalerService,
        private developerService: DeveloperService,
        private readonly entityManager: EntityManager,
        private rechargeService: RechargeCardService,
    ) {}

    async createRechargeCardBySaler(dto: SalerCreateRechargeCardDto, saler: Saler, cardType: RechargeCardType) {
        // 计算价格
        const priceResult = await this.salerService.getRechargeCardTypePrice(saler, cardType);
        if (saler.balance < priceResult.price * dto.count) {
            throw new NotAcceptableException('余额不足');
        }
        const developer = (await this.developerService.findById(saler.developerId)) as Developer;
        if (!developer) {
            throw new NotAcceptableException('开发者不存在');
        }
        // const createDetail = priceResult.result.map((item) => {
        //     return `${item.saler.name}：${item.price}元`
        // })
        try {
            await this.entityManager.transaction(async (manager) => {
                // 先扣钱再说
                await this.salerService.subBanlance(
                    developer,
                    saler,
                    Math.floor(priceResult.price * dto.count),
                    `制作充值卡[${cardType.name}${dto.count}张]`,
                    false,
                    undefined,
                    manager.getRepository(Saler),
                );
                // 生成充值卡
                await this.rechargeService.createRechargeCard(dto.appid, cardType, dto.description, saler.id, saler.name, dto.count, );
            });
        } catch (error) {
            throw new NotAcceptableException('系统错误，请稍后再试');
        }
    }
}
