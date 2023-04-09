import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service/base.service';
import { QuotaCard } from './quota-card.entity';
import { Repository } from 'typeorm';
import { Developer } from 'src/developer/developer.entity';
import { Quota } from '../quota.entity';

@Injectable()
export class QuotaCardService extends BaseService {
    constructor(
        @InjectRepository(QuotaCard)
        private repo: Repository<QuotaCard>,
    ) {
        super(repo);
    }

    async recharge(developer: Developer, card: string) {
        const quotaCard = await this.repo.findOne({ where: { card, status: 'unused' } });
        if (!quotaCard) {
            throw new NotAcceptableException('卡号不存在');
        }
        await this.repo.update(quotaCard.id, { status: 'used', usedAt: new Date(), usedBy: developer.name, developerId: developer.id });
        let addTime = 30 * 24 * 60 * 60 * 1000;
        if (developer.quota === 'default') {
            developer.quota = quotaCard.quota;
            developer.quotaExpiredAt = new Date(Date.now() + addTime);
            await this.repo.manager.getRepository(Developer).save(developer);
            return;
        }
        const nowTime = new Date().getTime();
        let expire = developer.quotaExpiredAt || new Date(nowTime);
        if (expire.getTime() < nowTime) {
            expire = new Date(nowTime);
        }
        // 计算价差和应得的时间
        const currentQuota = await this.repo.manager.getRepository(Quota).findOne({ where: { name: developer.quota } });
        const newQuota = await this.repo.manager.getRepository(Quota).findOne({ where: { name: quotaCard.quota } });
        const proportion = Number(currentQuota.price) / Number(newQuota.price);
        addTime = addTime + Math.floor(addTime * proportion);
        developer.quota = quotaCard.quota;
        developer.quotaExpiredAt = new Date(expire.getTime() + addTime);
        await this.repo.manager.getRepository(Developer).save(developer);
        return;
    }
}
