import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ApiTakeUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().user;
});
