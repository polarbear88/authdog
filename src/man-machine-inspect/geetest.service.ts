import { Injectable, InternalServerErrorException, Logger, NotAcceptableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { GeetestDto } from './geetest.dto';
import { CryptoUtils } from 'src/common/utils/crypyo.utils';
import qs from 'qs';
import { catchError, firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeetestService {
    constructor(private configService: ConfigService, private readonly httpService: HttpService) {}

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

    async validate(dto: GeetestDto, type: 'login' | 'register') {
        const config = this.getFullConfig();
        const key = type === 'login' ? config.geetest_key_login : config.geetest_key_register;
        const sign_token = CryptoUtils.hmacsha256(key, dto.lot_number);
        const data = qs.stringify({
            lot_number: dto.lot_number,
            captcha_output: dto.captcha_output,
            pass_token: dto.pass_token,
            gen_time: dto.gen_time,
            sign_token,
            captcha_id: type === 'login' ? config.geetest_id_login : config.geetest_id_register,
        });
        const response = await firstValueFrom(
            this.httpService.post('http://gcaptcha4.geetest.com/validate', data).pipe(
                catchError((error: any) => {
                    Logger.error('request geetest api error' + error);
                    throw new InternalServerErrorException('geetest api error');
                }),
            ),
        );
        if (response.status !== 200) {
            throw new InternalServerErrorException('geetest api error');
        }
        if (response.data.status !== 'success' || response.data.result !== 'success') {
            throw new NotAcceptableException('验证码验证失败');
        }
        return response.data;
    }
}
