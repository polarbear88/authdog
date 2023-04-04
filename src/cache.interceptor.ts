import { CACHE_MANAGER, CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { map, of } from 'rxjs';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
    async intercept(context: ExecutionContext, next: CallHandler) {
        const request = context.switchToHttp().getRequest();
        if (request.user && request.user.id) {
            const key = `cache:res:${request.user.roles[0]}:${request.user.id}:${request.originalUrl}`;
            const data = await this.cacheManager.get(key);
            if (data) {
                return of(JSON.parse(data as string));
            }
            return next.handle().pipe(
                map((data) => {
                    this.cacheManager
                        .set(key, JSON.stringify(data), 60)
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
