import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service/base.service';
import { Repository } from 'typeorm';
import { CreateRechargeCardTypeDto, UpdateRechargeCardTypeDto } from './recharge-card-type.dto';
import { RechargeCardType } from './recharge-card-type.entity';

@Injectable()
export class RechargeCardTypeService extends BaseService {
    constructor(
        @InjectRepository(RechargeCardType)
        private rechargeCardTypeRepository: Repository<RechargeCardType>,
    ) {
        super(rechargeCardTypeRepository);
    }

    async exists(appid: number, name: string) {
        return await this.rechargeCardTypeRepository.findOne({
            where: {
                appid,
                name,
            },
        });
    }

    async create(appid: number, createRechargeCardTypeDto: CreateRechargeCardTypeDto) {
        if (createRechargeCardTypeDto.money <= 0 && createRechargeCardTypeDto.time <= 0) {
            throw new NotAcceptableException('激活卡无效，次数和时间不能同时为0');
        }
        const rechargeCardType = new RechargeCardType();
        rechargeCardType.appid = appid;
        rechargeCardType.name = createRechargeCardTypeDto.name;
        rechargeCardType.isNeedPassword = createRechargeCardTypeDto.isNeedPassword;
        rechargeCardType.prefix = createRechargeCardTypeDto.prefix ? createRechargeCardTypeDto.prefix.trim() : '';
        rechargeCardType.isNeedPassword = createRechargeCardTypeDto.isNeedPassword;
        rechargeCardType.time = createRechargeCardTypeDto.time;
        rechargeCardType.money = createRechargeCardTypeDto.money;
        rechargeCardType.price = createRechargeCardTypeDto.price;
        rechargeCardType.salerPrice = createRechargeCardTypeDto.salerPrice;
        return await this.rechargeCardTypeRepository.save(rechargeCardType);
    }

    async getList(appid: number) {
        return await this.rechargeCardTypeRepository.find({
            where: {
                appid,
            },
            order: {
                id: 'DESC',
            },
        });
    }

    async delete(appid: number, id: number) {
        await this.rechargeCardTypeRepository.delete({
            appid,
            id,
        });
    }

    async findByAppidAndId(appid: number, id: number) {
        return await this.rechargeCardTypeRepository.findOne({
            where: {
                appid,
                id,
            },
        });
    }

    async update(appid: number, updateRechargeCardTypeDto: UpdateRechargeCardTypeDto) {
        if (updateRechargeCardTypeDto.money <= 0 && updateRechargeCardTypeDto.time <= 0) {
            throw new NotAcceptableException('激活卡无效，次数和时间不能同时为0');
        }
        const rechargeCardType = await this.findByAppidAndId(appid, updateRechargeCardTypeDto.id);
        if (!rechargeCardType) {
            throw new NotAcceptableException('激活卡类型不存在');
        }
        rechargeCardType.isNeedPassword = updateRechargeCardTypeDto.isNeedPassword;
        rechargeCardType.prefix = updateRechargeCardTypeDto.prefix ? updateRechargeCardTypeDto.prefix.trim() : '';
        rechargeCardType.time = updateRechargeCardTypeDto.time;
        rechargeCardType.money = updateRechargeCardTypeDto.money;
        rechargeCardType.price = updateRechargeCardTypeDto.price;
        rechargeCardType.salerPrice = updateRechargeCardTypeDto.salerPrice;
        return await this.rechargeCardTypeRepository.save(rechargeCardType);
    }
}
