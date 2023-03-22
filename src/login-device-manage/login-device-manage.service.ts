import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LoginDeviceManageService {
    constructor(@InjectRedis() private readonly redis: Redis) {}

    private suffix = '_login_device';

    async getDevices(userId: string | number) {
        return await this.redis.smembers(userId + this.suffix);
    }

    async addDevice(userId: string | number, deviceId: string) {
        await this.redis.sadd(userId + this.suffix, deviceId + ';' + Date.now());
    }

    async removeDevice(userId: string | number, deviceId: string) {
        await this.redis.srem(userId + this.suffix, deviceId);
    }

    async removeAllDevices(userId: string | number) {
        await this.redis.del(userId + this.suffix);
    }

    parseDevice(device: string) {
        const arr = device.split(';');
        return {
            deviceId: arr[0],
            timestamp: parseInt(arr[1]),
        };
    }
}
