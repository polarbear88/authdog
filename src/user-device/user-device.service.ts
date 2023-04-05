import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from 'src/application/application.entity';
import { IPAddrAscriptionPlace } from 'src/common/dto/ipaddr-ascription-place';
import { BaseService } from 'src/common/service/base.service';
import { StringUtils } from 'src/common/utils/string.utils';
import { Repository } from 'typeorm';
import { BaseUserDeviceDto } from './user-device.dto';
import { UserDevice } from './user-device.entity';

@Injectable()
export class UserDeviceService extends BaseService {
    constructor(
        @InjectRepository(UserDevice)
        private userDeviceRepository: Repository<UserDevice>,
    ) {
        super(userDeviceRepository);
    }

    async existByDeviceId(appid: number, deviceId: string) {
        return this.userDeviceRepository.exist({
            where: {
                appid,
                deviceId,
            },
        });
    }

    async findByDeviceId(appid: number, deviceId: string) {
        return this.userDeviceRepository.findOne({
            where: {
                appid,
                deviceId,
            },
        });
    }

    async create(app: Application, ip: string, baseUserDeviceDto: BaseUserDeviceDto) {
        const userDevice = new UserDevice();
        userDevice.developerId = app.developerId;
        userDevice.appid = app.id;
        userDevice.authMode = app.authMode;
        userDevice.brand = StringUtils.toString(baseUserDeviceDto.brand);
        userDevice.model = StringUtils.toString(baseUserDeviceDto.model);
        userDevice.osType = StringUtils.toString(baseUserDeviceDto.osType);
        userDevice.deviceId = baseUserDeviceDto.deviceId;
        userDevice.ip = {
            ipv4: ip,
            country: null,
            province: null,
            city: null,
            isp: null,
        };
        return await this.userDeviceRepository.save(userDevice);
    }

    async updateDeveloperIAP(id: number, iap: IPAddrAscriptionPlace) {
        await this.userDeviceRepository.update(id, {
            ip: {
                country: iap.country,
                province: iap.region,
                city: iap.city,
                isp: iap.isp,
            },
        });
    }

    async getAreaStatistics(developerId: number) {
        return await this.userDeviceRepository
            .createQueryBuilder()
            .where('developerId = :developerId', { developerId })
            .select(['ipProvince as `name`', 'COUNT(ipProvince) as `value`'])
            .groupBy('ipProvince')
            .getRawMany();
    }

    async getBrandStatistics(developerId: number) {
        return await this.userDeviceRepository
            .createQueryBuilder()
            .where('developerId = :developerId', { developerId })
            .select(['brand as `name`', 'COUNT(brand) as `value`'])
            .groupBy('brand')
            .getRawMany();
    }
}
