import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ExpressUtils } from './common/utils/express.utils';
import { CryptoUtils } from './common/utils/crypyo.utils';
import { Response } from 'express';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        // 强制设置响应状态码为200
        (context.switchToHttp().getResponse() as Response).status(200);
        // 设置禁止缓存
        (context.switchToHttp().getResponse() as Response).setHeader('Cache-Control', 'no-cache');
        (context.switchToHttp().getResponse() as Response).setHeader('Pragma', 'no-cache');
        (context.switchToHttp().getResponse() as Response).setHeader('Expires', '-1');

        // 获取是否是api请求是否需要加密响应
        const isEncrypt = !!request['is_need_encrypt_res'];
        // 修改响应内容以封装和加入基础数据
        return next.handle().pipe(
            mergeMap((data) => {
                const retBody = ExpressUtils.buildResponse('success', data);
                if (isEncrypt) {
                    return this.ayncPack(async () => {
                        return {
                            data: await CryptoUtils.encryptRespone(retBody, request),
                        };
                    });
                } else {
                    return this.ayncPack(retBody);
                }
            }),
        );
    }

    private async ayncPack(data: any) {
        if (typeof data === 'function') {
            return await data();
        }
        return data;
    }
}
