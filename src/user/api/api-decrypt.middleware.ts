import { Injectable, NotAcceptableException, BadRequestException, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Application } from 'src/provide/application/application.entity';
import { ApplicationService } from 'src/provide/application/application.service';
import { CryptoUtils } from 'src/common/utils/crypyo.utils';
import { CloudfunService } from 'src/provide/cloudfun/cloudfun.service';
import { CloudfunRuner } from 'src/provide/cloudfun/cloudfun-runer';

/**
 * API解密中间件-用于解密API请求
 */
@Injectable()
export class ApiDecryptMiddleware implements NestMiddleware {
    constructor(private applicationService: ApplicationService, private cloudfunService: CloudfunService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const request = req;
        // 防止jwt拿用户传入的header 中的token去校验
        request.headers['token'] = '';
        const app = await this.getApplication(request);
        const body = request.body;
        if (!body.data) {
            throw new BadRequestException('错误的请求');
        }
        const decryptData = await this.decryptBody(request, app);
        // 为了方便写api文档又兼容以前的传参新的公用参数放在baseBody中，这里将其合并到data中
        if (decryptData.baseBody) {
            Object.assign(decryptData, decryptData.baseBody);
            delete decryptData.baseBody;
        }
        // 校验时间戳，检查请求是否超时 防止请求重放
        this.checkTimestamp(parseInt(decryptData.timestamp));
        decryptData.appid = app.id;
        request.body = decryptData;
        // 将token放入header中，以便jwt校验
        if (decryptData.access_token && typeof decryptData.access_token === 'string') {
            request.headers['token'] = decryptData.access_token;
        }
        if (!decryptData.clientVersion || typeof decryptData.clientVersion !== 'string') {
            throw new BadRequestException('请传入客户端版本号');
        }
        request['clientVersion'] = decryptData.clientVersion;
        // 标记是否需要加密返回
        request['is_need_encrypt_res'] = true;
        next();
    }

    private checkTimestamp(timestamp: number) {
        if (!timestamp) {
            throw new NotAcceptableException('请求超时');
        }
        const now = new Date().getTime();
        if ((timestamp + '').length === 10) {
            timestamp = timestamp * 1000;
        }
        if (now - timestamp > 1000 * 60 * 5) {
            throw new NotAcceptableException('请求超时');
        }
    }

    private async decryptBody(request: any, app: Application) {
        const body = request.body;
        let data = body.data;
        if (app.customCryptFunId) {
            const fun = await this.cloudfunService.findByDeveloperIdAndId(app.developerId, app.customCryptFunId);
            if (!fun) {
                throw new BadRequestException('错误的请求, 找不到云函数');
            }
            if (typeof data !== 'string') {
                throw new BadRequestException('错误的请求');
            }
            request.customCryptScript = fun.script;
            try {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                data = await new CloudfunRuner({}, request.customCryptScript, (balance: number, reason: string) => {}).run(['de', data]);
            } catch (error) {
                Logger.error(error.message);
                throw new BadRequestException('云函数执行错误');
            }
        }

        if (app.cryptoMode === 'none') {
            if (typeof data !== 'object' && typeof data !== 'string') {
                throw new BadRequestException('错误的请求');
            }
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (error) {
                    throw new BadRequestException('错误的请求');
                }
            }
            return data;
        }
        if (typeof data !== 'string') {
            throw new BadRequestException('错误的请求');
        }
        if (app.cryptoMode === 'aes') {
            request.aesKey = app.cryptoSecret;
            return CryptoUtils.decryptAESJSON(data, app.cryptoSecret);
        }
        if (app.cryptoMode === 'samenc') {
            try {
                return JSON.parse(CryptoUtils.samdec(Buffer.from(data, 'base64')).toString());
            } catch (error) {
                throw new BadRequestException('错误的请求');
            }
        }
        if (!body.key || typeof body.key !== 'string') {
            throw new BadRequestException('错误的请求');
        }
        if (app.cryptoMode === 'rsa') {
            const endata = CryptoUtils.decryptRSAJSON(data, body.key, app.cryptoSecret);
            request.aesKey = endata.aesKey;
            return endata.data;
        }
        if (app.cryptoMode === 'ecdh') {
            const endata = CryptoUtils.decryptECDHJSON(data, body.key, app.cryptoSecret);
            request.aesKey = endata.aesKey;
            return endata.data;
        }
        throw new BadRequestException('错误的请求');
    }

    // private async tryRSAPublicKey(publicKey: string) {
    //     try {
    //         const rsa = new RSAUtils();
    //         rsa.setPublicKey(publicKey);
    //     } catch (error) {
    //         throw new BadRequestException('错误的请求');
    //     }
    // }

    private async getApplication(request: any) {
        let appid: number | null = null;
        if (request.body && request.body.appid) {
            appid = parseInt(request.body.appid);
        }
        if (!appid) {
            throw new NotAcceptableException('请传入appid');
        }
        const app = (await this.applicationService.findById(appid)) as Application;
        if (!app) {
            throw new NotAcceptableException('应用不存在');
        }
        if (app.deactivated) {
            throw new NotAcceptableException('应用已被停用');
        }
        request.application = app as Application;
        return app as Application;
    }
}
