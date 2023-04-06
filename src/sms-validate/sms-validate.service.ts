import { Injectable, NotAcceptableException } from '@nestjs/common';
import { AliSMSService } from './alisms.service';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { RandomUtils } from 'src/common/utils/random.utils';

@Injectable()
export class SMSValidateService {
    constructor(private readonly alismsService: AliSMSService, @InjectRedis() private readonly redis: Redis) {}

    async send(phone: string) {
        const key = `sms:${phone}`;
        const code = RandomUtils.getNumberString(6);
        await this.alismsService.sendSms(phone, code);
        await this.redis.set(key, code, 'EX', 300);
    }

    async validate(phone: string, code: string) {
        const key = `sms:${phone}`;
        const redisCode = await this.redis.get(key);
        if (redisCode && redisCode === code) {
            await this.redis.del(key);
            return true;
        }
        throw new NotAcceptableException('验证码错误');
    }
}
