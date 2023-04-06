import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service/base.service';
import { ECDHUtils } from 'src/common/utils/ecdh.utils';
import { RandomUtils } from 'src/common/utils/random.utils';
import { RSAUtils } from 'src/common/utils/rsa.utils';
import { Repository } from 'typeorm';
import { Application } from './application.entity';
import { AppCryptoMode, AppStatus } from './application.type';
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
        if (application.cryptoMode === 'ecdh') {
            this.makeECDHKeyPair(app);
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

    private makeECDHKeyPair(app: Application) {
        const ecdh = new ECDHUtils();
        app.cryptoSecret = ecdh.getPrivateKey().toString('hex');
        app.cryptoPublicKey = ecdh.getPublicKey().toString('hex');
    }

    async findByDeveloperIdAndId(developerId: number, id: number) {
        return await this.applicationRepository.findOne({ where: { developerId, id } });
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

    async getApplicationByIdAndDeveloperId(id: number, developerId: number) {
        return await this.applicationRepository.findOne({ where: { id, developerId } });
    }

    async setNotice(id: number, notice: string) {
        await this.applicationRepository.update(id, { notice });
    }

    async setStatus(id: number, status: AppStatus) {
        await this.applicationRepository.update(id, { status });
    }

    async setForceUpgrade(id: number, forceUpgrade: boolean) {
        await this.applicationRepository.update(id, { forceUpgrade });
    }

    async setDownloadUrl(id: number, downloadUrl: string) {
        await this.applicationRepository.update(id, { downloadUrl });
    }

    /**
     * 重置加密模式
     * @param id id
     * @param cryptoMode 加密模式
     */
    async resetCryptoMode(id: number, cryptoMode: AppCryptoMode) {
        const app = (await this.findById(id)) as Application;
        app.cryptoSecret = null;
        app.cryptoPublicKey = null;
        if (cryptoMode === 'aes') {
            app.cryptoSecret = RandomUtils.getHexString(32);
        }
        if (cryptoMode === 'rsa') {
            this.makeRSAKeyPair(app);
        }
        if (cryptoMode === 'ecdh') {
            this.makeECDHKeyPair(app);
        }
        app.cryptoMode = cryptoMode;
        await this.applicationRepository.save(app);
    }

    async setIsFree(id: number, isFree: boolean) {
        await this.applicationRepository.update(id, { free: isFree });
    }

    async setTrialTime(id: number, trialTime: number) {
        await this.applicationRepository.update(id, { trialTime });
    }

    async setBindDevice(id: number, bindDevice: boolean) {
        await this.applicationRepository.update(id, { bindDevice });
    }

    async setAllowUnbind(id: number, allowUnbind: boolean) {
        await this.applicationRepository.update(id, { allowUnbind });
    }

    async setUnbindDeductTime(id: number, unbindDeductTime: number) {
        await this.applicationRepository.update(id, { unbindDeductTime });
    }

    async setUnbindDeductCount(id: number, unbindDeductCount: number) {
        await this.applicationRepository.update(id, { unbindDeductCount });
    }

    async setMaxUnbindCount(id: number, maxUnbindCount: number) {
        await this.applicationRepository.update(id, { maxUnbindCount });
    }

    async setAllowMultiDevice(id: number, allowMultiDevice: boolean) {
        await this.applicationRepository.update(id, { allowMultiDevice });
    }

    async setMaxMultiDevice(id: number, maxMultiDevice: number) {
        await this.applicationRepository.update(id, { maxMultiDevice });
    }

    async setUseCountMode(id: number, useCountMode: boolean) {
        await this.applicationRepository.update(id, { useCountMode });
    }

    async setAllowLoginWhenCountUsedUp(id: number, allowLoginWhenCountUsedUp: boolean) {
        await this.applicationRepository.update(id, { allowLoginWhenCountUsedUp });
    }

    async setTrialCount(id: number, trialCount: number) {
        await this.applicationRepository.update(id, { trialCount });
    }

    async setAllowForceLogin(id: number, allowForceLogin: boolean) {
        await this.applicationRepository.update(id, { allowForceLogin });
    }

    async setVersion(id: number, version: string) {
        await this.applicationRepository.update(id, { version });
    }
}
