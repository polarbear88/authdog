import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service/base.service';
import { Device } from 'src/device/device.entity';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { UserFinancial } from './user-financial.entity';
import { UserFinancialGetListDto } from './user-financial.dto';
import { PaginationUtils } from 'src/common/pagination/pagination.utils';

@Injectable()
export class UserFinancialService extends BaseService {
    constructor(
        @InjectRepository(UserFinancial)
        private repo: Repository<UserFinancial>,
    ) {
        super(repo);
    }

    async createSubUserTime(user: User | Device, value: number, reason: string, before: string, other?: string, mgr = this.repo) {
        const userFinancial = new UserFinancial();
        userFinancial.appid = user.appid;
        userFinancial.developerId = user.developerId;
        if (user instanceof User) {
            userFinancial.userType = 'user';
            userFinancial.userId = user.id;
            userFinancial.name = user.name;
        } else {
            userFinancial.userType = 'deviceid';
            userFinancial.userId = user.id;
            userFinancial.name = user.deviceId;
        }
        userFinancial.type = 'time';
        userFinancial.direction = 'out';
        userFinancial.value = -value;
        userFinancial.reason = reason;
        userFinancial.other = other;
        userFinancial.before = before;
        return mgr.save(userFinancial);
    }

    async createAddUserTime(user: User | Device, value: number, reason: string, before: string, other?: string, mgr = this.repo) {
        const userFinancial = new UserFinancial();
        userFinancial.appid = user.appid;
        userFinancial.developerId = user.developerId;
        if (user instanceof User) {
            userFinancial.userType = 'user';
            userFinancial.userId = user.id;
            userFinancial.name = user.name;
        } else {
            userFinancial.userType = 'deviceid';
            userFinancial.userId = user.id;
            userFinancial.name = user.deviceId;
        }
        userFinancial.type = 'time';
        userFinancial.direction = 'in';
        userFinancial.value = value;
        userFinancial.reason = reason;
        userFinancial.other = other;
        userFinancial.before = before;
        return mgr.save(userFinancial);
    }

    async createSubUserBalance(user: User | Device, value: number, reason: string, before: string, other?: string, mgr = this.repo) {
        const userFinancial = new UserFinancial();
        userFinancial.appid = user.appid;
        userFinancial.developerId = user.developerId;
        if (user instanceof User) {
            userFinancial.userType = 'user';
            userFinancial.userId = user.id;
            userFinancial.name = user.name;
        } else {
            userFinancial.userType = 'deviceid';
            userFinancial.userId = user.id;
            userFinancial.name = user.deviceId;
        }
        userFinancial.type = 'balance';
        userFinancial.direction = 'out';
        userFinancial.value = -value;
        userFinancial.reason = reason;
        userFinancial.other = other;
        userFinancial.before = before;
        return mgr.save(userFinancial);
    }

    async createAddUserBalance(user: User | Device, value: number, reason: string, before: string, other?: string, mgr = this.repo) {
        const userFinancial = new UserFinancial();
        userFinancial.appid = user.appid;
        userFinancial.developerId = user.developerId;
        if (user instanceof User) {
            userFinancial.userType = 'user';
            userFinancial.userId = user.id;
            userFinancial.name = user.name;
        } else {
            userFinancial.userType = 'deviceid';
            userFinancial.userId = user.id;
            userFinancial.name = user.deviceId;
        }
        userFinancial.type = 'balance';
        userFinancial.direction = 'in';
        userFinancial.value = value;
        userFinancial.reason = reason;
        userFinancial.other = other;
        userFinancial.before = before;
        return mgr.save(userFinancial);
    }

    async getList(developerId: number, dto: UserFinancialGetListDto) {
        const where = [['developerId = :developerId', { developerId }]];
        const clDto = PaginationUtils.objectToDto(dto, new UserFinancialGetListDto());
        const data = await super.getPage(clDto, where, 'id', 'DESC');
        const amount_total = (await super.getAllQuery(clDto, where).select('SUM(value) as amount_total').execute())[0];
        return {
            total: data[1],
            list: data[0],
            amount_total: amount_total.amount_total,
        };
    }
}
