import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service/base.service';
import { RandomUtils } from 'src/common/utils/random.utils';
import { RSAUtils } from 'src/common/utils/rsa.utils';
import { Repository } from 'typeorm';
import { Application } from './application.entity';
import { CreateApplicationDto } from './dto/application.dto';

@Injectable()
export class ApplicationService extends BaseService {
    constructor(
        @InjectRepository(Application)
        private applicationRepository: Repository<Application>,
    ) {
        super(applicationRepository);
    }

    /**
     * 创建应用
     * @param application dto
     * @returns application
     */
    async createApplication(application: CreateApplicationDto, developerId: number): Promise<Application> {
        const app = new Application();
        app.name = application.name;
        app.version = application.version;
        app.cryptoMode = application.cryptoMode;
        if (application.cryptoMode === 'aes') {
            app.cryptoSecret = RandomUtils.getHexString(32);
        }
        if (application.cryptoMode === 'rsa') {
            this.makeRSAKeyPair(app);
        }
        app.authMode = application.authMode;
        app.developerId = developerId;
        return await this.applicationRepository.save(app);
    }

    private makeRSAKeyPair(app: Application) {
        const rsa = new RSAUtils();
        app.cryptoSecret = rsa.getPrivateKey();
        app.cryptoPublicKey = rsa.getPublicKey();
    }

    async findByDeveloperIdAndName(developerId: number, name: string) {
        return await this.applicationRepository.findOne({ where: { developerId, name } });
    }

    async existByDeveloperIdAndName(developerId: number, name: string) {
        return await this.applicationRepository.exist({ where: { developerId, name } });
    }

    async getListByDeveloperId(developerId: number) {
        return await this.applicationRepository.find({ where: { developerId }, order: { id: 'DESC' } });
    }
}
