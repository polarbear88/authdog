import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service/base.service';
import { OnlineUser } from './online-user.entity';
import { In, Repository } from 'typeorm';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Application } from '../application/application.entity';
import { Device } from 'src/user/device/device.entity';
import { User } from 'src/user/user/user.entity';
import { GetOnlineUserListDto } from './online-user.dto';
import { PaginationUtils } from 'src/common/pagination/pagination.utils';

@Injectable()
export class OnlineUserManagerService extends BaseService {
    constructor(
        @InjectRepository(OnlineUser)
        private repo: Repository<OnlineUser>,
        @InjectRedis() private readonly redis: Redis,
    ) {
        super(repo);
    }

    buildKey(appid: number, userId: number, deviceId: string) {
        return `online_user_manager_${appid}_${userId}_${deviceId}`;
    }

    async poll(app: Application, user: User | Device, deviceId: string) {
        let onlineUser = await this.repo.findOne({
            where: {
                appid: app.id,
                userId: user.id,
                deviceId,
            },
        });
        if (onlineUser) {
            await this.repo.update(onlineUser.id, {
                lastOnlineTime: new Date(),
            });
        } else {
            onlineUser = new OnlineUser();
            onlineUser.developerId = app.developerId;
            onlineUser.appid = app.id;
            onlineUser.appName = app.name;
            onlineUser.userId = user.id;
            onlineUser.userName = user instanceof User ? user.name : user.deviceId;
            onlineUser.lastOnlineTime = new Date();
            onlineUser.deviceId = deviceId;
            await this.repo.save(onlineUser);
        }
        const key = this.buildKey(app.id, user.id, deviceId);
        if (!(await this.redis.exists(key))) {
            await this.redis.set(key, '1');
        }
        await this.redis.expire(key, 300);
    }

    async isOnline(app: Application, user: User | Device, deviceId: string) {
        const key = this.buildKey(app.id, user.id, deviceId);
        return !!(await this.redis.exists(key));
    }

    async isOnline_id(appid: number, userId: number, deviceId: string) {
        const key = this.buildKey(appid, userId, deviceId);
        return !!(await this.redis.exists(key));
    }

    async logout(app: Application, user: User | Device, deviceId: string) {
        const key = this.buildKey(app.id, user.id, deviceId);
        await this.redis.del(key);
    }

    async logout_id(appid: number, userId: number, deviceId: string) {
        const key = this.buildKey(appid, userId, deviceId);
        await this.redis.del(key);
    }

    async getList(developerId: number, dto: GetOnlineUserListDto) {
        const data = await super.getPage(
            PaginationUtils.objectToDto(dto, new GetOnlineUserListDto()),
            [
                ['developerId = :developerId', { developerId }],
                ['lastOnlineTime >= :time', { time: new Date(Date.now() - 300000) }],
            ],
            'id',
            'DESC',
        );
        for (const item of data[0]) {
            item.isOnline = await this.isOnline_id(item.appid, item.userId, item.deviceId);
        }
        return {
            total: data[1],
            list: data[0],
        };
    }

    async kick(developerId: number, ids: number[]) {
        const onlineUsers = await this.repo.find({
            where: {
                developerId: developerId,
                id: In(ids),
            },
        });
        for (const onlineUser of onlineUsers) {
            await this.logout_id(onlineUser.appid, onlineUser.userId, onlineUser.deviceId);
        }
    }
}
