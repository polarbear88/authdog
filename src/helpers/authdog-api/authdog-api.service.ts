import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import os from 'os';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import https from 'https';

@Injectable()
export class AuthdogApiService implements OnApplicationBootstrap {
    private deviceId: string;
    private baseUrl = 'https://api.authdog.cn/api/v1';
    private appid = 118;
    private version = '1.6.0';
    private agent = new https.Agent({
        rejectUnauthorized: false,
    });

    constructor(private configService: ConfigService, private readonly httpService: HttpService) {
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
        const response = await this.baseRequest('/app/info');
        if (response.data.data.statusCode !== 200) {
            throw new Error(response.data.message);
        }
        return {
            newVersion: response.data.data.data.version,
            hasNew: response.data.data.data.version !== this.version,
            currentVersion: this.version,
        };
    }
}
