import { Injectable, NotAcceptableException, BadRequestException, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Application } from 'src/application/application.entity';
import { ApplicationService } from 'src/application/application.service';
import { CryptoUtils } from 'src/common/utils/crypyo.utils';
import { ECDHUtils } from 'src/common/utils/ecdh.utils';
import { RSAUtils } from 'src/common/utils/rsa.utils';

/**
 * API解密中间件-用于解密API请求
 */
@Injectable()
export class ApiDecryptMiddleware implements NestMiddleware {
    constructor(private applicationService: ApplicationService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const request = req;
        // 防止jwt拿用户传入的header 中的token去校验
        request.headers['token'] = '';
        const app = await this.getApplication(request);
        const body = request.body;
        if (!body.data) {
            throw new BadRequestException('错误的请求');
        }
        const decryptData = this.decryptBody(request, app);
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

    private decryptBody(request: any, app: Application) {
        const body = request.body;
        const data = body.data;
        if (app.cryptoMode === 'none') {
            if (typeof data !== 'object') {
                throw new BadRequestException('错误的请求');
            }
            return data;
        }
        if (typeof data !== 'string') {
            throw new BadRequestException('错误的请求');
        }
        if (app.cryptoMode === 'aes') {
            request.aesKey = app.cryptoSecret;
            return this.decryptAES(data, app.cryptoSecret);
        }
        if (!body.key || typeof body.key !== 'string') {
            throw new BadRequestException('错误的请求');
        }
        if (app.cryptoMode === 'rsa') {
            const endata = this.decryptRSA(data, body.key, app.cryptoSecret);
            request.aesKey = endata.aesKey;
            return endata.data;
        }
        if (app.cryptoMode === 'ecdh') {
            const endata = this.decryptECDH(data, body.key, app.cryptoSecret);
            request.aesKey = endata.aesKey;
            return endata.data;
        }
        throw new BadRequestException('错误的请求');
    }

    private decryptECDH(data: any, clientPublicKey: string, privateKey: string) {
        try {
            const ecdh = new ECDHUtils();
            ecdh.setPrivateKey(Buffer.from(privateKey, 'hex'));
            const sharedSecret = ecdh.getSharedSecret(Buffer.from(clientPublicKey, 'hex')).toString('hex');
            const aesKey = sharedSecret.slice(0, 32);
            return {
                data: this.decryptAES(data, aesKey),
                aesKey,
            };
        } catch (error) {
            throw new BadRequestException('错误的请求');
        }
    }

    // private async tryRSAPublicKey(publicKey: string) {
    //     try {
    //         const rsa = new RSAUtils();
    //         rsa.setPublicKey(publicKey);
    //     } catch (error) {
    //         throw new BadRequestException('错误的请求');
    //     }
    // }

    private decryptRSA(data: string, aesKeyData: string, privateKey: string) {
        try {
            const rsa = new RSAUtils();
            rsa.setPrivateKey(privateKey);
            const aeskey = rsa.decrypt(Buffer.from(aesKeyData, 'base64')).toString();
            if (!aeskey || aeskey.length !== 32) {
                throw new BadRequestException('错误的请求');
            }
            return {
                data: this.decryptAES(data, aeskey),
                aesKey: aeskey,
            };
        } catch (error) {
            throw new BadRequestException('错误的请求');
        }
    }

    private decryptAES(data: string, key: string) {
        try {
            const decryptData = CryptoUtils.aesCBCDecrypt(Buffer.from(data, 'base64'), key, 'aes-256-cbc', '0000000000000000', true);
            if (!decryptData) {
                throw new BadRequestException('错误的请求');
            }
            return JSON.parse(decryptData.toString());
        } catch (error) {
            throw new BadRequestException('错误的请求');
        }
    }

    private async getApplication(request: any) {
        let appid: number | null = null;
        if (request.body && request.body.appid) {
            appid = parseInt(request.body.appid);
        }
        if (!appid) {
            throw new NotAcceptableException('请传入appid');
        }
        const app = await this.applicationService.findById(appid);
        if (!app) {
            throw new NotAcceptableException('应用不存在');
        }
        request.application = app as Application;
        return app as Application;
    }
}
