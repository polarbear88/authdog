import { CanActivate, ExecutionContext, Injectable, NotAcceptableException } from '@nestjs/common';
import { ManMachineInspectService } from './man-machine-inspect.service';
import { MAN_MACHINE_INSPECT_TYPE_KEY } from './man-machine-inspect.decorator';
import { Reflector } from '@nestjs/core';
import { plainToInstance } from 'class-transformer';
import { GeetestDto } from './geetest.dto';
import { validate } from 'class-validator';
import { ManMachineInspectEnum } from './man-machine-inspect.enum';

@Injectable()
export class ManMachineInspectGuard implements CanActivate {
    constructor(private manMachineInspectService: ManMachineInspectService, private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const type = this.reflector.getAllAndOverride(MAN_MACHINE_INSPECT_TYPE_KEY, [context.getHandler(), context.getClass()]);
        if (!type) {
            return true;
        }
        if (type === ManMachineInspectEnum.LOGIN) {
            if (this.manMachineInspectService.getConfig().validate_enable_login) {
                await this.manMachineInspectService.validateCaptchaLogin(await this.getGetestCaptcha(context));
            }
        }
        if (type === ManMachineInspectEnum.REGISTER) {
            if (this.manMachineInspectService.getConfig().validate_enable_register) {
                await this.manMachineInspectService.validateCaptchaRegister(await this.getGetestCaptcha(context));
            }
        }
        return true;
    }

    async getGetestCaptcha(context: ExecutionContext) {
        if (!context.switchToHttp().getRequest().body) {
            throw new NotAcceptableException('请先完成人机验证');
        }
        const captcha = context.switchToHttp().getRequest().body.geetest_captcha;
        if (!captcha || typeof captcha !== 'object') {
            throw new NotAcceptableException('请先完成人机验证');
        }
        const dto = plainToInstance(GeetestDto, captcha);
        const errors = await validate(dto);
        if (errors.length > 0) {
            throw new NotAcceptableException('请先完成人机验证');
        }
        return dto;
    }
}
