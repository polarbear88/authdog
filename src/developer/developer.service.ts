import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service/base.service';
import { CryptoUtils } from 'src/common/utils/crypyo.utils';
import { RandomUtils } from 'src/common/utils/random.utils';
import { Repository } from 'typeorm';
import { CreateDeveloperDto } from './developer.dto';
import { Developer } from './developer.entity';

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
        developer.name = createDeveloperDto.name;
        developer.mobile = createDeveloperDto.mobile;
        developer.salt = RandomUtils.getHexString(8);
        developer.password = CryptoUtils.md5(createDeveloperDto.password + developer.salt);
        developer.ip = {
            ipv4: ip,
            country: null,
            province: null,
            city: null,
        };
        return this.developerRepository.save(developer);
    }
}
