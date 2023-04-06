import { Injectable, NotAcceptableException } from '@nestjs/common';
import { AliSMSService } from './alisms.service';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { RandomUtils } from 'src/common/utils/random.utils';
import { RateLimiterRedis } from 'rate-limiter-flexible';

@Injectable()
export class SMSValidateService {
    private limitor_minute: RateLimiterRedis;
    private limitor_hour: RateLimiterRedis;
    private limitor_ip: RateLimiterRedis;

    constructor(private readonly alismsService: AliSMSService, @InjectRedis() private readonly redis: Redis) {
        // 创建限制器 80秒一次 1小时20次
        this.limitor_minute = new RateLimiterRedis({
            storeClient: redis,
            keyPrefix: 'limit_sms_minute',
            points: 1,
            duration: 80,
        });
        this.limitor_hour = new RateLimiterRedis({
            storeClient: redis,
            keyPrefix: 'limit_sms_hour',
            points: 20,
            duration: 3600,
        });
        this.limitor_ip = new RateLimiterRedis({
            storeClient: redis,
            keyPrefix: 'limit_sms_ip',
            points: 20,
            duration: 3600,
        });
    }

    async send(phone: string, ip: string) {
        try {
            await this.limitor_minute.consume(phone);
            await this.limitor_hour.consume(phone);
            await this.limitor_ip.consume(ip);
        } catch (error) {
            throw new NotAcceptableException('发送太频繁');
        }
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
