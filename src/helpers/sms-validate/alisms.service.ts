import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';

@Injectable()
export class AliSMSService {
    private client: Dysmsapi20170525;
    private runtime: any;
    private signName: string;
    private templateCode: string;

    constructor(private configService: ConfigService, private readonly httpService: HttpService) {
        const config = new $OpenApi.Config({
            // 必填，您的 AccessKey ID
            accessKeyId: this.configService.get('ALIYUN_ACCESS_KEY_ID'),
            // 必填，您的 AccessKey Secret
            accessKeySecret: this.configService.get('ALIYUN_ACCESS_KEY_SECRET'),
        });
        // 访问的域名
        config.endpoint = `dysmsapi.aliyuncs.com`;
        this.client = new Dysmsapi20170525(config);
        this.runtime = new $Util.RuntimeOptions({});
        this.signName = this.configService.get('ALIYUN_SMS_SIGN_NAME');
        this.templateCode = this.configService.get('ALIYUN_SMS_TEMPLATE_CODE');
    }

    async sendSms(phone: string, code: string) {
        try {
            const sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
                phoneNumbers: phone,
                signName: this.signName,
                templateCode: this.templateCode,
                templateParam: `{"code":"${code}"}`,
            });
            const response = await this.client.sendSmsWithOptions(sendSmsRequest, this.runtime);
            if (response.body.code !== 'OK') {
                throw new Error(response.body.message);
            }
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException('发送短信失败');
        }
    }
}
