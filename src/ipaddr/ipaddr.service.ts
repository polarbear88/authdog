import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { IPAddrAscriptionPlace } from '../common/dto/ipaddr-ascription-place';

@Injectable()
export class IPAddrService {
    private readonly logger = new Logger(IPAddrService.name);
    constructor(private readonly httpService: HttpService, private configService: ConfigService) {}

    /**
     * 获取IP地址归属地
     * @param ip ip地址
     * @returns 归属地
     */
    async getIPAddrAscriptionPlace(ip: string): Promise<IPAddrAscriptionPlace> {
        if (this.checkIPIsLAN(ip)) {
            const iap = new IPAddrAscriptionPlace();
            iap.isp = 'LAN';
            iap.region = 'LAN';
            iap.city = 'LAN';
            iap.district = 'LAN';
            iap.country = 'LAN';
            return iap;
        }
        const { data } = await firstValueFrom(
            this.httpService
                .get(`https://api01.aliyun.venuscn.com/ip?ip=${ip}`, {
                    headers: {
                        Authorization: `APPCODE ${this.configService.get('IP_API_KEY')}`,
                    },
                })
                .pipe(
                    catchError((error: any) => {
                        this.logger.error('request ip api error' + error);
                        throw error;
                    }),
                ),
        );
        if (data.ret !== 200) {
            this.logger.error('request ip api error' + data.msg);
            throw new Error(data.msg);
        }
        const iap = new IPAddrAscriptionPlace();
        iap.isp = data.data.isp;
        iap.region = data.data.region;
        iap.city = data.data.city;
        iap.district = data.data.district;
        iap.country = data.data.country;
        return iap;
    }

    /**
     * 检查是否是内网IP
     * @param ip ip
     * @returns 布尔
     */
    checkIPIsLAN(ip: string): boolean {
        if (ip.startsWith('127.')) {
            return true;
        }
        if (ip.startsWith('192.168.')) {
            return true;
        }
        if (ip.startsWith('10.')) {
            return true;
        }
        if (ip.startsWith('172.16.')) {
            return true;
        }
        return false;
    }
}
