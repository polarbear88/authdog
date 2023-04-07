import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExpressUtils } from './common/utils/express.utils';
import { CryptoUtils } from './common/utils/crypyo.utils';

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
                        data: CryptoUtils.encryptRespone(retBody, request),
                    };
                } else {
                    return retBody;
                }
            }),
        );
    }
}
