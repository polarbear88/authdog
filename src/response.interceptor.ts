import { Injectable, NestInterceptor, ExecutionContext, CallHandler, InternalServerErrorException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExpressUtils } from './common/utils/express.utils';
import { CryptoUtils } from './common/utils/crypyo.utils';
import { Application } from './provide/application/application.entity';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const isEncrypt = !!request['is_need_encrypt_res'];
        // 修改响应内容以封装和加入基础数据
        return next.handle().pipe(
            map((data) => {
                const retBody = ExpressUtils.buildResponse('success', data);
                if (isEncrypt) {
                    return {
                        data: this.encrypt(retBody, request),
                    };
                } else {
                    return retBody;
                }
            }),
        );
    }

    private encrypt(data: any, request: any) {
        if (data === null || data === undefined) {
            return data;
        }
        if (typeof data === 'object') {
            data.currentDeviceId = request.currentDeviceId;
        }
        const app = request.application as Application;
        if (!app) {
            throw new InternalServerErrorException('服务器错误');
        }
        if (app.cryptoMode === 'none') {
            return data;
        }
        data = typeof data === 'object' ? JSON.stringify(data) : data + '';
        if (app.cryptoMode === 'samenc') {
            return CryptoUtils.samenc(Buffer.from(data));
        }
        const key = request.aesKey;
        if (!key) {
            throw new InternalServerErrorException('服务器错误');
        }
        return this.encryptAES(data, key);
    }

    private encryptAES(data: any, key: string) {
        try {
            const encryptData = CryptoUtils.aesCBCEncrypt(Buffer.from(data), key, 'aes-256-cbc', '0000000000000000', true);
            if (!encryptData) {
                throw new InternalServerErrorException('服务器错误');
            }
            return encryptData.toString('base64');
        } catch (error) {
            throw new InternalServerErrorException('服务器错误');
        }
    }
}
