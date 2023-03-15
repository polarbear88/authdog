import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TakeDeveloper = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().user;
});
