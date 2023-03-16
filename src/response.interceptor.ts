import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExpressUtils } from './common/utils/express.utils';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        // 修改响应内容以封装和加入基础数据
        return next.handle().pipe(
            map((data) => {
                return ExpressUtils.buildResponse('success', data);
            }),
        );
    }
}
