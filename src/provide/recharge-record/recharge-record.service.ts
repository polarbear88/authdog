import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/service/base.service';
import { Repository } from 'typeorm';
import { RechargeRecord } from './recharge-record.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user/user.entity';
import { Device } from 'src/user/device/device.entity';
import { Application } from '../application/application.entity';
import { RechargeCard } from '../recharge-card/recharge-card.entity';
import { GetRechargeRecordListDto } from './recharge-record.dto';
import { PaginationUtils } from 'src/common/pagination/pagination.utils';

@Injectable()
export class RechargeRecordService extends BaseService {
    constructor(
        @InjectRepository(RechargeRecord)
        private repo: Repository<RechargeRecord>,
    ) {
        super(repo);
    }

    async createRechargeRecord(user: User | Device, app: Application, card: RechargeCard, mgr?: Repository<RechargeRecord>) {
        const record = new RechargeRecord();
        record.appName = app.name;
        record.appid = app.id;
        record.cardId = card.id;
        record.cardNumber = card.card;
        record.cardTypeId = card.cardTypeId;
        record.cardTypeName = card.cardTypeName;
        record.developerId = app.developerId;
        record.money = card.money;
        record.salerId = card.creator;
        record.salerName = card.creator > 0 ? card.creatorName : '开发者';
        record.time = card.time;
        record.user = user.id;
        record.userName = user instanceof User ? user.name : user.deviceId;
        const manager = mgr || this.repo;
        await manager.save(record);
    }

    async getList(developerId: number, salerId: number, dto: GetRechargeRecordListDto) {
        const wherearr: any = [['developerId = :developerId', { developerId }]];
        if (salerId > 0) {
            wherearr.push(['salerId = :salerId', { salerId }]);
        }
        const data = await super.getPage(PaginationUtils.objectToDto(dto, new GetRechargeRecordListDto()), wherearr, 'id', 'DESC');
        return {
            total: data[1],
            list: data[0],
        };
    }
}
