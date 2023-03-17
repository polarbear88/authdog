import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Application } from 'src/application/application.entity';

export const TakeApplication = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().application as Application;
});
