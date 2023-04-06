import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { CryptoUtils } from './common/utils/crypyo.utils';
import { Application } from './provide/application/application.entity';

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
                    data: this.encrypt(resData, request),
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
