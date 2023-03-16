import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    // 拦截所有异常并封装数据来返回
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        // const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        let message = exception.message;
        if (exception.getResponse() instanceof Object && (exception.getResponse() as any).message) {
            message = (exception.getResponse() as any).message;
            if ((message as any) instanceof Array) {
                message = message[0];
            }
        }

        response.status(HttpStatus.OK).json({
            statusCode: status,
            message: message,
            data: null,
            timestamp: new Date().getTime(),
        });
    }
}
