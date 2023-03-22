import { Injectable, NestInterceptor, ExecutionContext, CallHandler, InternalServerErrorException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Application } from 'src/application/application.entity';
import { CryptoUtils } from 'src/common/utils/crypyo.utils';

@Injectable()
export class ApiEncryptInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        // 拦截API请求，对返回数据进行加密
        return next.handle().pipe(
            map((data) => {
                const request = context.switchToHttp().getRequest();
                return this.encrypt(data, request);
            }),
        );
    }

    private encrypt(data: any, request: any) {
        if (data === null || data === undefined) {
            return data;
        }
        const app = request.application as Application;
        if (!app) {
            throw new InternalServerErrorException('服务器错误');
        }
        if (app.cryptoMode === 'none') {
            return data;
        }
        data = typeof data === 'object' ? JSON.stringify(data) : data + '';
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
