import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from 'src/application/application.entity';
import { IPAddrAscriptionPlace } from 'src/common/dto/ipaddr-ascription-place';
import { BaseService } from 'src/common/service/base.service';
import { StringUtils } from 'src/common/utils/string.utils';
import { Repository } from 'typeorm';
import { DeviceDto } from './device.dto';
import { Device } from './device.entity';

@Injectable()
export class DeviceService extends BaseService {
    constructor(
        @InjectRepository(Device)
        private deviceRepository: Repository<Device>,
    ) {
        super(deviceRepository);
    }

    async findByAppidAndDeviceId(appid: number, deviceId: string) {
        return await this.deviceRepository.findOne({
            where: {
                appid,
                deviceId,
            },
        });
    }

    async create(app: Application, deviceDto: DeviceDto, ip: string) {
        const device = new Device();
        device.appid = app.id;
        device.deviceId = deviceDto.deviceId;
        if (StringUtils.isNotEmpty(deviceDto.otherInfo)) {
            device.otherInfo = deviceDto.otherInfo;
        }
        device.ip = {
            ipv4: ip,
            city: null,
            country: null,
            province: null,
            isp: null,
        };
        if (StringUtils.isNotEmpty(deviceDto.brand)) {
            device.brand = deviceDto.brand;
        }
        if (StringUtils.isNotEmpty(deviceDto.model)) {
            device.model = deviceDto.model;
        }
        if (StringUtils.isNotEmpty(deviceDto.osType)) {
            device.osType = deviceDto.osType;
        }
        // 添加试用
        if (app.useCountMode && app.trialCount > 0) {
            device.balance = app.trialCount;
        }
        if (app.trialTime > 0) {
            device.expirationTime = new Date(new Date().getTime() + app.trialTime * 1000 * 60);
            device.trialExpiration = device.expirationTime;
        } else {
            // 防止下次请求过快导致误判
            device.expirationTime = new Date(new Date().getTime() - 1000 * 60);
        }
        return await this.deviceRepository.save(device);
    }

    async setLastLoginTime(id: number) {
        return await this.deviceRepository.update(id, {
            lastLoginTime: new Date(),
        });
    }

    async updateDeveloperIAP(id: number, iap: IPAddrAscriptionPlace) {
        await this.deviceRepository.update(id, {
            ip: {
                country: iap.country,
                province: iap.region,
                city: iap.city,
                isp: iap.isp,
            },
        });
    }

    validateUserAuth(app: Application, device: Device) {
        // 验证时间
        const { result, expire } = this.validateUserAuthForDate(device, app);
        if (!result) {
            return {
                result: false,
                expire,
                msg: '已过期',
            };
        }
        if (app.useCountMode && !app.allowLoginWhenCountUsedUp) {
            if (device.balance <= 0) {
                return {
                    result: false,
                    expire,
                    msg: '额度已用完',
                };
            }
        }
        return {
            result: true,
            expire,
            msg: '',
        };
    }

    private validateUserAuthForDate(device: Device, app: Application) {
        if (app.free) {
            return {
                result: true,
                expire: new Date('2099-12-31'),
            };
        }
        return {
            result: device.expirationTime.getTime() > new Date().getTime(),
            expire: device.expirationTime,
        };
    }
}
