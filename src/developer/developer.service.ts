import { ForbiddenException, Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service/base.service';
import { CryptoUtils } from 'src/common/utils/crypyo.utils';
import { StringUtils } from 'src/common/utils/string.utils';
import { Repository } from 'typeorm';
import { CreateDeveloperDto, LoginDeveloperDto } from './dto/developer.dto';
import { Developer } from './developer.entity';
import { IPAddrAscriptionPlace } from 'src/common/dto/ipaddr-ascription-place';

@Injectable()
export class DeveloperService extends BaseService {
    constructor(
        @InjectRepository(Developer)
        private developerRepository: Repository<Developer>,
    ) {
        super(developerRepository);
    }

    async findByName(name: string) {
        return this.developerRepository.findOne({ where: { name } });
    }

    async findByMobile(mobile: string) {
        return this.developerRepository.findOne({ where: { mobile } });
    }

    async existsByName(name: string) {
        return this.developerRepository.exist({ where: { name } });
    }

    async existsByMobile(mobile: string) {
        return this.developerRepository.exist({ where: { mobile } });
    }

    async createDeveloper(createDeveloperDto: CreateDeveloperDto, ip: string) {
        const developer = new Developer();
        developer.name = createDeveloperDto.username;
        developer.mobile = createDeveloperDto.mobile;
        developer.salt = CryptoUtils.makeSalt();
        developer.password = CryptoUtils.encryptPassword(createDeveloperDto.password, developer.salt);
        developer.ip = {
            ipv4: ip,
            country: null,
            province: null,
            city: null,
            isp: null,
        };
        return this.developerRepository.save(developer);
    }

    /**
     * 验证用户登录
     * @param name 名称或手机号
     * @param password 密码md5值
     * @returns 结果
     */
    async validateUser(loginDeveloperDto: LoginDeveloperDto) {
        let developer: Developer;
        if (StringUtils.charIsNumber(loginDeveloperDto.username)) {
            developer = await this.findByMobile(loginDeveloperDto.username);
        } else {
            developer = await this.findByName(loginDeveloperDto.username);
        }
        if (developer && CryptoUtils.validatePassword(loginDeveloperDto.password, developer.salt, developer.password)) {
            if (developer.status !== 'normal') {
                throw new ForbiddenException('账号状态异常');
            }
            this.developerRepository.update(developer.id, { lastLoginTime: new Date() });
            return developer;
        }
        throw new NotAcceptableException('用户名或密码错误');
    }

    async updateDeveloperIAP(id: number, iap: IPAddrAscriptionPlace) {
        await this.developerRepository.update(id, {
            ip: {
                country: iap.country,
                province: iap.region,
                city: iap.city,
                isp: iap.isp,
            },
        });
    }

    async getStatus(id: number) {
        const developer = await this.developerRepository.findOne({
            where: { id },
            select: ['status'],
        });
        if (developer) {
            return developer.status;
        }
        return null;
    }

    async validateStatus(id: number) {
        const status = await this.getStatus(id);
        if (status !== 'normal') {
            return false;
        }
        return true;
    }
}
