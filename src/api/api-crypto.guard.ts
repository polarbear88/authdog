import { Injectable, CanActivate, ExecutionContext, NotAcceptableException, BadRequestException } from '@nestjs/common';
import { Application } from 'src/application/application.entity';
import { ApplicationService } from 'src/application/application.service';
import { CryptoUtils } from 'src/common/utils/crypyo.utils';
import { ECDHUtils } from 'src/common/utils/ecdh.utils';
import { RSAUtils } from 'src/common/utils/rsa.utils';

/**
 * API加密守卫-用于解密API请求
 */
@Injectable()
export class ApiCryptoGuard implements CanActivate {
    constructor(private applicationService: ApplicationService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const app = await this.getApplication(request);
        const body = request.body;
        if (!body.data) {
            throw new BadRequestException('错误的请求');
        }
        const decryptData = this.decryptBody(request, app);
        this.checkTimestamp(parseInt(decryptData.timestamp));
        request.body = decryptData;
        return true;
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
        if (app.cryptoMode === 'aes') {
            if (typeof data !== 'string') {
                throw new BadRequestException('错误的请求');
            }
            request.publicKey = app.cryptoSecret;
            return this.decryptAES(data, app.cryptoSecret);
        }
        if (app.cryptoMode === 'rsa') {
            if (typeof data !== 'string') {
                throw new BadRequestException('错误的请求');
            }
            if (!body.publicKey || !body.aesKey) {
                throw new BadRequestException('错误的请求');
            }
            if (typeof body.publicKey !== 'string' || typeof body.aesKey !== 'string') {
                throw new BadRequestException('错误的请求');
            }
            const publicKey = body.publicKey;
            this.tryRSAPublicKey(publicKey);
            request.publicKey = publicKey;
            return this.decryptRSA(data, body.aesKey, app.cryptoSecret);
        }
        if (app.cryptoMode === 'ecdh') {
            if (typeof data !== 'string') {
                throw new BadRequestException('错误的请求');
            }
            if (!body.publicKey) {
                throw new BadRequestException('错误的请求');
            }
            if (typeof body.publicKey !== 'string') {
                throw new BadRequestException('错误的请求');
            }
            const publicKey = body.publicKey;
            request.publicKey = publicKey;
            return this.decryptECDH(data, publicKey, app.cryptoSecret);
        }
    }

    private async decryptECDH(data: any, clientPublicKey: string, privateKey: string) {
        try {
            const ecdh = new ECDHUtils();
            ecdh.setPrivateKey(Buffer.from(privateKey, 'hex'));
            const sharedSecret = ecdh.getSharedSecret(Buffer.from(clientPublicKey, 'hex')).toString('hex');
            return this.decryptAES(data, sharedSecret.slice(0, 32));
        } catch (error) {
            throw new BadRequestException('错误的请求');
        }
    }

    private async tryRSAPublicKey(publicKey: string) {
        try {
            const rsa = new RSAUtils();
            rsa.setPublicKey(publicKey);
        } catch (error) {
            throw new BadRequestException('错误的请求');
        }
    }

    private async decryptRSA(data: string, aesKeyData: string, privateKey: string) {
        try {
            const rsa = new RSAUtils();
            rsa.setPrivateKey(privateKey);
            const aeskey = rsa.decrypt(Buffer.from(aesKeyData, 'base64')).toString();
            if (!aeskey || aeskey.length !== 32) {
                throw new BadRequestException('错误的请求');
            }
            return this.decryptAES(data, aeskey);
        } catch (error) {
            throw new BadRequestException('错误的请求');
        }
    }

    private async decryptAES(data: string, key: string) {
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
