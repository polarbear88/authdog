import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';
import { ExpressUtils } from './common/utils/express.utils';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
    // 让限流器可以获取到真实IP
    protected getTracker(req: Record<string, any>): string {
        return ExpressUtils.getIp(req);
    }
}
