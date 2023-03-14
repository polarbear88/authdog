import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ExpressUtils } from '../utils/express.utils';

// 获取真实IP
export const RealIP = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return ExpressUtils.getIp(request);
});
