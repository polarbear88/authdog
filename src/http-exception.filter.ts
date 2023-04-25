import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { CryptoUtils } from './common/utils/crypyo.utils';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    // 拦截所有异常并封装数据来返回
    async catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        let message = exception.message;
        if (exception.getResponse() instanceof Object && (exception.getResponse() as any).message) {
            message = (exception.getResponse() as any).message;
            if ((message as any) instanceof Array) {
                message = message[0];
            }
        }

        const isEncrypt = !!request['is_need_encrypt_res'];
        let resData = {
            statusCode: status,
            message: message,
            data: {},
            timestamp: new Date().getTime(),
        };
        if (isEncrypt) {
            // 加密响应
            try {
                (resData as any) = {
                    data: await CryptoUtils.encryptRespone(resData, request),
                };
            } catch (e) {
                resData = {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: '服务器错误',
                    data: {},
                    timestamp: new Date().getTime(),
                };
            }
        }
        // 设置禁止缓存
        response.setHeader('Cache-Control', 'no-cache');
        response.setHeader('Pragma', 'no-cache');
        response.setHeader('Expires', '-1');
        response.status(HttpStatus.OK).json(resData);
    }
}
