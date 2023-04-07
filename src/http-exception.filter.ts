import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { CryptoUtils } from './common/utils/crypyo.utils';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    // 拦截所有异常并封装数据来返回
    catch(exception: HttpException, host: ArgumentsHost) {
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
            data: null,
            timestamp: new Date().getTime(),
        };
        if (isEncrypt) {
            try {
                (resData as any) = {
                    data: CryptoUtils.encryptRespone(resData, request),
                };
            } catch (e) {
                resData = {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: '服务器错误',
                    data: null,
                    timestamp: new Date().getTime(),
                };
            }
        }
        response.status(HttpStatus.OK).json(resData);
    }
}
