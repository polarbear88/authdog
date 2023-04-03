import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service/base.service';
import { Developer } from 'src/developer/developer.entity';
import { Saler } from 'src/saler/saler.entity';
import { Repository } from 'typeorm';
import { FundFlow } from './fund-flow.entity';

@Injectable()
export class FundFlowService extends BaseService {
    constructor(
        @InjectRepository(FundFlow)
        private repo: Repository<FundFlow>,
    ) {
        super(repo);
    }

    async create(direction: 'in' | 'out', developer: Developer, saler: Saler | null, amount: number, reason: string, before: number, other?: string) {
        const fundflow = new FundFlow();
        fundflow.developerId = developer.id;
        fundflow.developerName = developer.name;
        if (saler) {
            fundflow.roleType = 'saler';
            fundflow.salerId = saler.id;
            fundflow.salerName = saler.name;
        } else {
            fundflow.roleType = 'developer';
        }
        fundflow.direction = direction;
        fundflow.amount = amount.toFixed(2);
        fundflow.reason = reason;
        fundflow.other = other;
        fundflow.before = before.toFixed(2);
        return this.repo.save(fundflow);
    }

    async createSubBalance(developer: Developer, saler: Saler | null, amount: number, reason: string, before: number, other?: string) {
        return await this.create('out', developer, saler, -amount, reason, before, other);
    }

    async createAddBalance(developer: Developer, saler: Saler | null, amount: number, reason: string, before: number, other?: string) {
        return await this.create('in', developer, saler, amount, reason, before, other);
    }
}
