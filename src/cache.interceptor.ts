import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, of } from 'rxjs';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Reflector } from '@nestjs/core';
import { CACHE_TTL_KEY } from './common/decorator/caceh-ttl.decorator';

// 缓存拦截器
@Injectable()
export class CacheInterceptor implements NestInterceptor {
    constructor(@InjectRedis() private readonly redis: Redis, private reflector: Reflector) {}

    async intercept(context: ExecutionContext, next: CallHandler) {
        const request = context.switchToHttp().getRequest();
        if (request.user && request.user.id) {
            const key = `cache:res:${request.user.roles[0]}:${request.user.id}:${request.originalUrl}`;
            const data = await this.redis.get(key);
            if (data) {
                // 从缓存数据返回
                return of(JSON.parse(data as string));
            }
            const cache_ttl = this.reflector.getAllAndOverride(CACHE_TTL_KEY, [context.getHandler(), context.getClass()]) || 60;
            return next.handle().pipe(
                map((data) => {
                    this.redis
                        .set(key, JSON.stringify(data), 'EX', cache_ttl)
                        .then(() => {
                            //
                        })
                        .catch((err) => {
                            //
                        });
                    return data;
                }),
            );
        }
        return next.handle();
    }
}
