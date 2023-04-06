import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Application } from 'src/provide/application/application.entity';

export const TakeApplication = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().application as Application;
});
