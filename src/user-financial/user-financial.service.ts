import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service/base.service';
import { Device } from 'src/device/device.entity';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { UserFinancial } from './user-financial.entity';

@Injectable()
export class UserFinancialService extends BaseService {
    constructor(
        @InjectRepository(UserFinancial)
        private repo: Repository<UserFinancial>,
    ) {
        super(repo);
    }

    async createSubUserTime(user: User | Device, value: number, reason: string, before: string, other?: string) {
        const userFinancial = new UserFinancial();
        userFinancial.appid = user.appid;
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
        userFinancial.value = value;
        userFinancial.reason = reason;
        userFinancial.other = other;
        userFinancial.before = before;
        return this.repo.save(userFinancial);
    }

    async createAddUserTime(user: User | Device, value: number, reason: string, before: string, other?: string) {
        const userFinancial = new UserFinancial();
        userFinancial.appid = user.appid;
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
        return this.repo.save(userFinancial);
    }

    async createSubUserBalance(user: User | Device, value: number, reason: string, before: string, other?: string) {
        const userFinancial = new UserFinancial();
        userFinancial.appid = user.appid;
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
        userFinancial.value = value;
        userFinancial.reason = reason;
        userFinancial.other = other;
        userFinancial.before = before;
        return this.repo.save(userFinancial);
    }

    async createAddUserBalance(user: User | Device, value: number, reason: string, before: string, other?: string) {
        const userFinancial = new UserFinancial();
        userFinancial.appid = user.appid;
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
        return this.repo.save(userFinancial);
    }
}
