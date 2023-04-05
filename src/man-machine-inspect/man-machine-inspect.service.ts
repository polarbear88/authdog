import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeetestDto } from './geetest.dto';
import { GeetestService } from './geetest.service';

@Injectable()
export class ManMachineInspectService {
    constructor(private configService: ConfigService, private geetestService: GeetestService) {}

    getFullConfig() {
        return {
            geetest_id_login: this.configService.get('GEETEST_ID_LOGIN'),
            geetest_key_login: this.configService.get('GEETEST_KEY_LOGIN'),
            geetest_id_register: this.configService.get('GEETEST_ID_REGISTER'),
            geetest_key_register: this.configService.get('GEETEST_KEY_REGISTER'),
            validate_enable_login: this.configService.get('VALIDATE_ENABLE_LOGIN') === 'true',
            validate_enable_register: this.configService.get('VALIDATE_ENABLE_REGISTER') === 'true',
        };
    }

    getConfig() {
        return {
            geetest_id_login: this.configService.get('GEETEST_ID_LOGIN'),
            geetest_id_register: this.configService.get('GEETEST_ID_REGISTER'),
            validate_enable_login: this.configService.get('VALIDATE_ENABLE_LOGIN') === 'true',
            validate_enable_register: this.configService.get('VALIDATE_ENABLE_REGISTER') === 'true',
        };
    }

    async validateCaptchaLogin(dto: GeetestDto) {
        return await this.geetestService.validate(dto, 'login');
    }

    async validateCaptchaRegister(dto: GeetestDto) {
        return await this.geetestService.validate(dto, 'register');
    }
}
