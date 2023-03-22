import { ForbiddenException, Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from 'src/application/application.entity';
import { IPAddrAscriptionPlace } from 'src/common/dto/ipaddr-ascription-place';
import { BaseService } from 'src/common/service/base.service';
import { CryptoUtils } from 'src/common/utils/crypyo.utils';
import { DateUtils } from 'src/common/utils/date.utils';
import { StringUtils } from 'src/common/utils/string.utils';
import { LoginDeviceManageService } from 'src/login-device-manage/login-device-manage.service';
import { Repository } from 'typeorm';
import { CreateUserDto, LoginUserDto } from './user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService extends BaseService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private loginDeviceManageService: LoginDeviceManageService,
    ) {
        super(userRepository);
    }

    async existsByName(appid: number, name: string) {
        return this.userRepository.exist({
            where: {
                appid,
                name,
            },
        });
    }

    async existsByMobile(appid: number, mobile: string) {
        return this.userRepository.exist({
            where: {
                appid,
                mobile,
            },
        });
    }

    async getStatus(id: number) {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['status'],
        });
        if (user) {
            return user.status;
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

    async create(createUserDto: CreateUserDto, app: Application, ip: string) {
        const user = new User();
        user.appid = app.id;
        user.name = createUserDto.name;
        user.mobile = StringUtils.toString(createUserDto.mobile);
        user.otherInfo = StringUtils.toString(createUserDto.otherInfo);
        user.salt = CryptoUtils.makeSalt();
        user.password = CryptoUtils.encryptPassword(createUserDto.password, user.salt);
        user.ip = {
            ipv4: ip,
            country: null,
            province: null,
            city: null,
            isp: null,
        };
        // 添加试用
        if (app.useCountMode && app.trialCount > 0) {
            user.balance = app.trialCount;
        }
        if (app.trialTime > 0) {
            user.expirationTime = new Date(new Date().getTime() + app.trialTime * 1000 * 60);
            user.trialExpiration = user.expirationTime;
        } else {
            // 防止下次请求过快导致误判
            user.expirationTime = new Date(new Date().getTime() - 1000 * 60);
        }
        user.useDeviceName = createUserDto.brand + '-' + createUserDto.model;
        if (app.bindDevice) {
            user.currentDeviceId = createUserDto.deviceId;
        }
        return await this.userRepository.save(user);
    }

    async updateDeveloperIAP(id: number, iap: IPAddrAscriptionPlace) {
        await this.userRepository.update(id, {
            ip: {
                country: iap.country,
                province: iap.region,
                city: iap.city,
                isp: iap.isp,
            },
        });
    }

    async findByName(appid: number, name: string) {
        return this.userRepository.findOne({ where: { appid, name } });
    }

    async findByMobile(appid: number, mobile: string) {
        return this.userRepository.findOne({ where: { appid, mobile } });
    }

    async validateUser(loginUserDto: LoginUserDto) {
        const user = await this.findByName(loginUserDto.appid, loginUserDto.name);
        if (user && CryptoUtils.validatePassword(loginUserDto.password, user.salt, user.password)) {
            if (user.status !== 'normal') {
                throw new ForbiddenException('账号状态异常');
            }
            if (!DateUtils.compareYMD(new Date(), user.expirationTime)) {
                this.userRepository.update(user.id, { lastLoginTime: new Date() });
            }
            return user;
        }
        throw new NotAcceptableException('用户名或密码错误');
    }

    validateUserAuth(user: User, app: Application, deviceId: string) {
        // 验证时间
        const { result, expire } = this.validateUserAuthForDate(user, app);
        if (!result) {
            return {
                result: false,
                expire,
                msg: '账号已过期',
            };
        }
        // 验证是否绑定设备
        if (app.bindDevice) {
            if (user.currentDeviceId !== deviceId) {
                return {
                    result: false,
                    expire,
                    msg: '已绑定设备，不允许在其他设备登录',
                };
            }
        }
        // 验证次数
        if (app.useCountMode && !app.allowLoginWhenCountUsedUp) {
            if (user.balance <= 0) {
                return {
                    result: false,
                    expire,
                    msg: '账号额度已用完',
                };
            }
        }
        return {
            result: true,
            expire,
            msg: '',
        };
    }

    private validateUserAuthForDate(user: User, app: Application) {
        if (app.free) {
            return {
                result: true,
                expire: new Date('2099-12-31'),
            };
        }
        return {
            result: user.expirationTime.getTime() > new Date().getTime(),
            expire: user.expirationTime,
        };
    }

    async validateUserMultipledeviceLogin(user: User, app: Application) {
        const deviceIds = await this.loginDeviceManageService.getDevices(user.id);
        if (deviceIds.length > app.maxMultiDevice) {
            if (app.allowForceLogin) {
            }
        }
    }
}
