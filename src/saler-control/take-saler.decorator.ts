import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TakeSaler = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().user;
});
