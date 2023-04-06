import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeetestDto } from './geetest.dto';
import { GeetestService } from './geetest.service';

@Injectable()
export class ManMachineInspectService {
    private cacheFullConfig: {
        geetest_id_login: any;
        geetest_key_login: any;
        geetest_id_register: any;
        geetest_key_register: any;
        validate_enable_login: boolean;
        validate_enable_register: boolean;
        validate_enable_sendsms: boolean;
        developer_register_enable_sms: boolean;
    };
    private cacheConfig: {
        geetest_id_login: any;
        geetest_id_register: any;
        validate_enable_login: boolean;
        validate_enable_register: boolean;
        validate_enable_sendsms: boolean;
        developer_register_enable_sms: boolean;
    };

    constructor(private configService: ConfigService, private geetestService: GeetestService) {}

    getFullConfig() {
        if (!this.cacheFullConfig) {
            this.cacheFullConfig = {
                geetest_id_login: this.configService.get('GEETEST_ID_LOGIN'),
                geetest_key_login: this.configService.get('GEETEST_KEY_LOGIN'),
                geetest_id_register: this.configService.get('GEETEST_ID_REGISTER'),
                geetest_key_register: this.configService.get('GEETEST_KEY_REGISTER'),
                validate_enable_login: this.configService.get('VALIDATE_ENABLE_LOGIN') === 'true',
                validate_enable_register: this.configService.get('VALIDATE_ENABLE_REGISTER') === 'true',
                validate_enable_sendsms: this.configService.get('VALIDATE_ENABLE_SENDSMS') === 'true',
                developer_register_enable_sms: this.configService.get('DEVELOPER_REGISTER_ENABLE_SMS') === 'true',
            };
        }
        return this.cacheFullConfig;
    }

    getConfig() {
        if (!this.cacheConfig) {
            this.cacheConfig = {
                geetest_id_login: this.configService.get('GEETEST_ID_LOGIN'),
                geetest_id_register: this.configService.get('GEETEST_ID_REGISTER'),
                validate_enable_login: this.configService.get('VALIDATE_ENABLE_LOGIN') === 'true',
                validate_enable_register: this.configService.get('VALIDATE_ENABLE_REGISTER') === 'true',
                validate_enable_sendsms: this.configService.get('VALIDATE_ENABLE_SENDSMS') === 'true',
                developer_register_enable_sms: this.configService.get('DEVELOPER_REGISTER_ENABLE_SMS') === 'true',
            };
        }
        return this.cacheConfig;
    }

    async validateCaptchaLogin(dto: GeetestDto) {
        return await this.geetestService.validate(dto, 'login');
    }

    async validateCaptchaRegister(dto: GeetestDto) {
        return await this.geetestService.validate(dto, 'register');
    }
}
