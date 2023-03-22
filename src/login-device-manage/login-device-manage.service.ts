import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';

//TODO 若一个用户同时登录的设备太多可能会导致性能问题，所以需要限制开发者设置的同时登录最大设备数
@Injectable()
export class LoginDeviceManageService {
    constructor(@InjectRedis() private readonly redis: Redis) {}

    private suffix_list = ':login:device';
    private suffix_time = ':login:device:time';

    async getDevices(userId: string | number) {
        return await this.redis.smembers(userId + this.suffix_list);
    }

    async addDevice(userId: string | number, deviceId: string) {
        await this.removeDevice(userId, deviceId);
        await this.redis.sadd(userId + this.suffix_list, deviceId);
        await this.redis.set(userId + ':' + deviceId + this.suffix_time, Date.now() + '');
    }

    async removeDevice(userId: string | number, deviceId: string) {
        await this.redis.srem(userId + this.suffix_list, deviceId);
        await this.redis.del(userId + ':' + deviceId + this.suffix_time);
    }

    async removeAllDevices(userId: string | number) {
        const devices = await this.getDevices(userId);
        const promises = devices.map(async (device) => {
            await this.removeDevice(userId, device);
        });
        await Promise.all(promises);
    }

    async isDeviceExist(userId: string | number, deviceId: string) {
        const i = await this.redis.sismember(userId + this.suffix_list, deviceId);
        return i === 1;
    }

    async getLength(userId: string | number) {
        return await this.redis.scard(userId + this.suffix_list);
    }

    async pop(userId: string | number) {
        const deviceId = await this.redis.spop(userId + this.suffix_list);
        if (deviceId) {
            await this.redis.del(userId + ':' + deviceId + this.suffix_time);
        }
        return deviceId;
    }

    async updateDevice(userId: string | number, deviceId: string) {
        await this.redis.set(userId + ':' + deviceId + this.suffix_time, Date.now() + '');
    }

    async cleanExpiredDevices(userId: string | number, expiredTime: number) {
        const devices = await this.getDevices(userId);
        const now = Date.now();
        const promises = devices.map(async (device) => {
            const timestamp = await this.redis.get(userId + ':' + device + this.suffix_time);
            if (!timestamp) {
                await this.removeDevice(userId, device);
            } else {
                if (now - parseInt(timestamp) > expiredTime) {
                    await this.removeDevice(userId, device);
                }
            }
        });
        await Promise.all(promises);
    }
}
