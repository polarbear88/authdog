import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotAcceptableException, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import os from 'os';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import https from 'https';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';

@Injectable()
export class AuthdogApiService implements OnApplicationBootstrap {
    private deviceId: string;
    private baseUrl = 'https://api.authdog.cn/api/v1';
    private appid = 118;
    private version = '1.6.0';
    private agent = new https.Agent({
        rejectUnauthorized: false,
    });

    constructor(private configService: ConfigService, private readonly httpService: HttpService, @InjectRedis() private readonly redis: Redis) {
        this.deviceId = this.configService.get('APP_JWT_SECRET');
    }

    onApplicationBootstrap() {
        this.init()
            .then()
            .catch((e) => {
                Logger.error(e.message, e.stack, 'AuthdogApiService');
            });
    }

    private baseRequest(path: string, data?: Record<string, any>): Promise<AxiosResponse<any, any>> {
        if (!data) data = {};
        return firstValueFrom(
            this.httpService.post(
                this.baseUrl + path,
                {
                    appid: this.appid,
                    data: {
                        baseBody: {
                            timestamp: new Date().getTime(),
                            clientVersion: this.version,
                            deviceId: this.deviceId,
                            brand: process.platform,
                            model: os.release(),
                            osType: os.type(),
                        },
                        ...data,
                    },
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    httpsAgent: this.agent,
                },
            ),
        );
    }

    async init() {
        await this.baseRequest('/device/auth');
    }

    async getVersion() {
        const cacheData = await this.redis.get('authdog:version');
        if (cacheData) {
            return JSON.parse(cacheData);
        }
        const response = await this.baseRequest('/app/info');
        if (response.data.data.statusCode !== 200) {
            throw new NotAcceptableException(response.data.data.message);
        }
        const result = {
            newVersion: response.data.data.data.version,
            hasNew: response.data.data.data.version !== this.version,
            currentVersion: this.version,
            notice: response.data.data.data.notice,
        };
        await this.redis.set('authdog:version', JSON.stringify(result), 'EX', 600);
        return result;
    }

    async getBuyUrl(): Promise<string> {
        const cacheData = await this.redis.get('authdog:buyUrl');
        if (cacheData) {
            return cacheData;
        }
        const response = await this.baseRequest('/cloudvar/getByName', {
            varname: 'buy_url',
        });
        if (response.data.data.statusCode !== 200) {
            throw new NotAcceptableException(response.data.data.message);
        }
        const result = response.data.data.data.value;
        await this.redis.set('authdog:buyUrl', result, 'EX', 600);
        return result;
    }

    async getAuthResult(refresh = false): Promise<{ auth: boolean; isTryTime: boolean; expire: number }> {
        try {
            if (!refresh) {
                const cacheData = await this.redis.get('authdog:authResult');
                if (cacheData) {
                    return JSON.parse(cacheData);
                }
            }
            const response = await this.baseRequest('/device/auth');
            if (response.data.data.statusCode !== 200) {
                throw new NotAcceptableException(response.data.data.message);
            }
            const result = {
                auth: response.data.data.data.auth.result,
                isTryTime: response.data.data.data.auth.isTryTime,
                expire: response.data.data.data.auth.expire,
            };
            await this.redis.set('authdog:authResult', JSON.stringify(result), 'EX', 600);
            return result;
        } catch (error) {
            // 宽容一点，如果遇到错误 比如Authdog服务器无法连接 或者其他情况导致异常 就直接给授权吧
            return {
                auth: true,
                isTryTime: false,
                expire: new Date().getTime(),
            };
        }
    }

    async recharge(card: string) {
        const response = await this.baseRequest('/device/recharge', {
            card,
        });
        if (response.data.data.statusCode !== 200) {
            throw new NotAcceptableException(response.data.data.message);
        }
        await this.redis.del('authdog:authResult');
    }
}
