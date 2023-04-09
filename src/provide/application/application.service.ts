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
import { UserService } from 'src/user/user/user.service';
import { DeviceService } from 'src/user/device/device.service';
import { UserDataService } from '../user-data/user-data.service';
import { UserFinancialService } from 'src/user/user-financial/user-financial.service';
import { Device } from 'src/user/device/device.entity';
import { User } from 'src/user/user/user.entity';
import { UserFinancial } from 'src/user/user-financial/user-financial.entity';
import { UserData } from '../user-data/user-data.entity';
import { UserDeviceService } from 'src/user/user-device/user-device.service';
import { UserDevice } from 'src/user/user-device/user-device.entity';
import { RechargeCardTypeService } from '../recharge-card/card-type/recharge-card-type.service';
import { RechargeCardService } from '../recharge-card/recharge-card.service';
import { RechargeCardType } from '../recharge-card/card-type/recharge-card-type.entity';
import { RechargeCard } from '../recharge-card/recharge-card.entity';
import { FeedbackService } from '../feedback/feedback.service';
import { Feedback } from '../feedback/feedback.entity';

@Injectable()
export class ApplicationService extends BaseService {
    constructor(
        @InjectRepository(Application)
        private applicationRepository: Repository<Application>,
        private userService: UserService,
        private deviceService: DeviceService,
        private userDataService: UserDataService,
        private userFinancialService: UserFinancialService,
        private userDeviceService: UserDeviceService,
        private rechargeCardTypeService: RechargeCardTypeService,
        private rechargeCardService: RechargeCardService,
        private feedbackService: FeedbackService,
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

    async delete(app: Application) {
        await this.applicationRepository.delete(app.id);
        // 删除用户
        if (app.authMode === 'deviceid') {
            await (this.deviceService.getRepo() as Repository<Device>).delete({
                appid: app.id,
            });
        } else {
            await (this.userService.getRepo() as Repository<User>).delete({
                appid: app.id,
            });
        }
        // 删除用户财务动态
        await (this.userFinancialService.getRepo() as Repository<UserFinancial>).delete({
            appid: app.id,
        });
        // 删除用户数据
        await (this.userDataService.getRepo() as Repository<UserData>).delete({
            appid: app.id,
        });
        // 删除用户设备记录
        await (this.userDeviceService.getRepo() as Repository<UserDevice>).delete({
            appid: app.id,
        });
        // 删除卡类型
        await (this.rechargeCardTypeService.getRepo() as Repository<RechargeCardType>).delete({
            appid: app.id,
        });
        // 删除充值卡
        await (this.rechargeCardService.getRepo() as Repository<RechargeCard>).delete({
            appid: app.id,
        });
        // 删除用户反馈数据
        await (this.feedbackService.getRepo() as Repository<Feedback>).delete({
            appid: app.id,
        });
    }

    async getDeveloperAppCount(developerId: number) {
        return this.applicationRepository.count({ where: { developerId } });
    }
}
