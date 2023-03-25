import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Device } from 'src/device/device.entity';

export const ApiTakeDevice = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().device as Device;
});
