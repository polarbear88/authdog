import { ForbiddenException, Injectable, InternalServerErrorException, NotAcceptableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from 'src/provide/application/application.entity';
import { IPAddrAscriptionPlace } from 'src/common/dto/ipaddr-ascription-place';
import { Role } from 'src/common/enums/role.enum';
import { PaginationUtils } from 'src/common/pagination/pagination.utils';
import { BaseService } from 'src/common/service/base.service';
import { CryptoUtils } from 'src/common/utils/crypyo.utils';
import { DateUtils } from 'src/common/utils/date.utils';
import { EntityUtils } from 'src/common/utils/entity.utils';
import { StringUtils } from 'src/common/utils/string.utils';
import { LoginDeviceManageService } from 'src/user/login-device-manage/login-device-manage.service';
import { RechargeCard } from 'src/provide/recharge-card/recharge-card.entity';
import { RechargeCardService } from 'src/provide/recharge-card/recharge-card.service';
import { UserFinancialService } from 'src/user/user-financial/user-financial.service';
import { EntityManager, In, Repository, SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm';
import {
    AddUserBanlanceDto,
    AddUserTimeDto,
    ChangePasswordDto,
    ChangeUserPwdByDevDto,
    CreateUserDto,
    GetUserListDto,
    LoginUserDto,
    UserRechargeDto,
} from './user.dto';
import { User } from './user.entity';
import { UserStatus } from './user.type';
import { UserFinancial } from 'src/user/user-financial/user-financial.entity';
import { UserDataService } from 'src/provide/user-data/user-data.service';
import { UserData } from 'src/provide/user-data/user-data.entity';

@Injectable()
export class UserService extends BaseService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private loginDeviceManageService: LoginDeviceManageService,
        private userFinancialService: UserFinancialService,
        private rechargeCardService: RechargeCardService,
        private readonly entityManager: EntityManager,
        private jwtService: JwtService,
        private userDataService: UserDataService,
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

    async getCurrentDeviceId(id: number) {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['currentDeviceId'],
        });
        if (user) {
            return user.currentDeviceId;
        }
        return null;
    }

    async setCurrentDeviceId(id: number, deviceId: string) {
        await this.userRepository.update(id, { currentDeviceId: deviceId });
    }

    async create(createUserDto: CreateUserDto, app: Application, ip: string) {
        const user = new User();
        user.appid = app.id;
        user.developerId = app.developerId;
        user.name = createUserDto.name;
        user.mobile = StringUtils.toString(createUserDto.mobile);
        user.otherInfo = StringUtils.toString(createUserDto.otherInfo);
        user.salt = CryptoUtils.makeSalt();
        user.password = CryptoUtils.encryptPassword(createUserDto.password, user.salt);
        user.rawPassword = createUserDto.password;
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
        user.useDeviceName = StringUtils.toString(createUserDto.brand) + '-' + StringUtils.toString(createUserDto.model);
        if (app.bindDevice) {
            user.currentDeviceId = createUserDto.deviceId;
        }
        return await this.userRepository.save(user);
    }

    async changePassword(changePasswordDto: ChangePasswordDto) {
        const user = await this.findByName(changePasswordDto.appid, changePasswordDto.name);
        if (user && CryptoUtils.validatePassword(changePasswordDto.oldPassword, user.salt, user.password)) {
            const salt = CryptoUtils.makeSalt();
            const password = CryptoUtils.encryptPassword(changePasswordDto.newPassword, salt);
            await this.userRepository.update(user.id, { salt, password, rawPassword: changePasswordDto.newPassword });
            return true;
        }
        throw new NotAcceptableException('用户名或密码错误');
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
            if (!DateUtils.compareYMD(new Date(), user.lastLoginTime)) {
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
            if (user.currentDeviceId && user.currentDeviceId !== deviceId) {
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

    validateUserAuthForDate(user: User, app: Application) {
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

    async validateUserMultipledeviceLogin(user: User, app: Application, deviceId: string) {
        // 清理5分钟没有心跳的设备
        await this.loginDeviceManageService.cleanExpiredDevices(user.id, 5 * 60 * 100);
        if (await this.loginDeviceManageService.isDeviceExist(user.id, deviceId)) {
            // 设备已存在 允许同设备多开
            await this.loginDeviceManageService.updateDevice(user.id, deviceId);
            return true;
        }
        const loginLength = await this.loginDeviceManageService.getLength(user.id);
        let maxLength = app.maxMultiDevice;
        if (!app.allowMultiDevice) {
            // 不允许多设备登录
            maxLength = 1;
        }
        if (loginLength >= maxLength) {
            if (app.allowForceLogin) {
                // 强制登录
                await this.loginDeviceManageService.pop(user.id);
                await this.loginDeviceManageService.addDevice(user.id, deviceId);
                return true;
            }
            return false;
        } else {
            await this.loginDeviceManageService.addDevice(user.id, deviceId);
            return true;
        }
    }

    async subUserBalanceAndExpirationTime(user: User, minute: number, balance: number, reason: string) {
        const affected = await this.userRepository
            .createQueryBuilder()
            .where('id = :id', { id: user.id })
            .andWhere('ver = :ver', { ver: user.ver })
            .andWhere(`DATE_SUB(expirationTime, INTERVAL ${minute} MINUTE) >= NOW()`)
            .andWhere(`balance >= ${balance}`)
            .update({
                expirationTime: () => `DATE_SUB(expirationTime, INTERVAL ${minute} MINUTE)`,
                balance: () => `balance - ${balance}`,
                ver: () => 'ver + 1',
            })
            .execute();
        if (affected.affected > 0) {
            await this.userFinancialService.createSubUserTime(user, minute, reason, DateUtils.formatDateTime(user.expirationTime));
            await this.userFinancialService.createSubUserBalance(user, balance, reason, user.balance + '');
            return true;
        }
        throw new NotAcceptableException('操作失败');
    }

    async subBanlance(
        user: User | Array<number>,
        balance: number,
        reason: string,
        force = false,
        whereCallback?: (query: SelectQueryBuilder<User>) => void,
    ) {
        const query = this.userRepository.createQueryBuilder();
        if (Array.isArray(user)) {
            query.where('id in (:...ids)', { ids: user });
        } else {
            query.where('id = :id', { id: user.id }).andWhere('ver = :ver', { ver: user.ver });
        }
        if (!force) {
            query.andWhere(`balance >= ${balance}`);
        }
        if (whereCallback) {
            whereCallback(query);
        }
        const affected = await query
            .update({
                balance: () => `GREATEST(balance - ${balance}, 0)`,
                ver: () => 'ver + 1',
            })
            .execute();
        if (affected.affected > 0) {
            if (!Array.isArray(user)) {
                await this.userFinancialService.createSubUserBalance(user, balance, reason, user.balance + '');
            }
            return affected.affected;
        }
        throw new NotAcceptableException('操作失败，可能次数不足');
    }

    async subExpirationTime(
        user: User | Array<number>,
        minute: number,
        reason: string,
        force = false,
        whereCallback?: (query: SelectQueryBuilder<User>) => void,
    ) {
        const query = this.userRepository.createQueryBuilder();
        if (Array.isArray(user)) {
            query.where('id in (:...ids)', { ids: user });
        } else {
            query.where('id = :id', { id: user.id });
            query.andWhere('ver = :ver', { ver: user.ver });
        }
        if (!force) {
            query.andWhere(`DATE_SUB(expirationTime, INTERVAL ${minute} MINUTE) >= NOW()`);
        }
        if (whereCallback) {
            whereCallback(query);
        }
        const affected = await query
            .update({
                expirationTime: () => `DATE_SUB(expirationTime, INTERVAL ${minute} MINUTE)`,
                ver: () => 'ver + 1',
            })
            .execute();
        if (affected.affected > 0) {
            if (!Array.isArray(user)) {
                await this.userFinancialService.createSubUserTime(user, minute, reason, DateUtils.formatDateTime(user.expirationTime));
            }
            return affected.affected;
        }
        throw new NotAcceptableException('操作失败');
    }

    async addBanlance(
        user: User | Array<number>,
        balance: number,
        reason: string,
        whereCallback?: (query: SelectQueryBuilder<User>) => void,
        manager: Repository<User> = this.userRepository,
    ) {
        const mgr = manager || this.userRepository;
        const query = mgr.createQueryBuilder();
        if (Array.isArray(user)) {
            query.where('id in (:...ids)', { ids: user });
        } else {
            query.where('id = :id', { id: user.id }).andWhere('ver = :ver', { ver: user.ver });
        }
        if (whereCallback) {
            whereCallback(query);
        }
        const affected = await query
            .update({
                balance: () => `balance + ${balance}`,
                ver: () => 'ver + 1',
            })
            .execute();
        if (affected.affected > 0) {
            if (!Array.isArray(user)) {
                await this.userFinancialService.createAddUserBalance(
                    user,
                    balance,
                    reason,
                    user.balance + '',
                    undefined,
                    manager.manager.getRepository(UserFinancial),
                );
            }
            return affected.affected;
        }
        throw new NotAcceptableException('操作失败');
    }

    async addExpirationTime(
        user: User | Array<number>,
        minute: number,
        reason: string,
        whereCallback?: (query: SelectQueryBuilder<User>) => void,
        manager: Repository<User> = this.userRepository,
    ) {
        const mgr = manager || this.userRepository;
        const query = mgr.createQueryBuilder();
        if (Array.isArray(user)) {
            query.where('id in (:...ids)', { ids: user });
        } else {
            query.where('id = :id', { id: user.id }).andWhere('ver = :ver', { ver: user.ver });
        }
        if (whereCallback) {
            whereCallback(query);
        }
        const affected = await query
            .update({
                expirationTime: () => `DATE_ADD(GREATEST(expirationTime, NOW()), INTERVAL ${minute} MINUTE)`,
                ver: () => 'ver + 1',
            })
            .execute();
        if (affected.affected > 0) {
            if (!Array.isArray(user)) {
                await this.userFinancialService.createAddUserTime(
                    user,
                    minute,
                    reason,
                    DateUtils.formatDateTime(user.expirationTime),
                    undefined,
                    manager.manager.getRepository(UserFinancial),
                );
            }
            return affected.affected;
        }
        throw new NotAcceptableException('操作失败');
    }

    async addBanlanceAndExpirationTime(user: User, minute: number, balance: number, reason: string, manager: Repository<User> = this.userRepository) {
        const mgr = manager || this.userRepository;
        const affected = await mgr
            .createQueryBuilder()
            .where('id = :id', { id: user.id })
            .andWhere('ver = :ver', { ver: user.ver })
            .update({
                expirationTime: () => `DATE_ADD(GREATEST(expirationTime, NOW()), INTERVAL ${minute} MINUTE)`,
                balance: () => `balance + ${balance}`,
                ver: () => 'ver + 1',
            })
            .execute();
        if (affected.affected > 0) {
            await this.userFinancialService.createAddUserTime(
                user,
                minute,
                reason,
                DateUtils.formatDateTime(user.expirationTime),
                undefined,
                manager.manager.getRepository(UserFinancial),
            );
            await this.userFinancialService.createAddUserBalance(
                user,
                balance,
                reason,
                user.balance + '',
                undefined,
                manager.manager.getRepository(UserFinancial),
            );
            return true;
        }
        throw new NotAcceptableException('操作失败');
    }

    async getList(appid: number, dto: GetUserListDto) {
        const data = await super.getPage(PaginationUtils.objectToDto(dto, new GetUserListDto()), [['appid = :appid', { appid }]], 'id', 'DESC');
        return {
            total: data[1],
            list: EntityUtils.serializationEntityArr(data[0], true, ['ip']),
        };
    }

    async findByAppidAndId(appid: number, id: number) {
        return this.userRepository.findOne({ where: { appid, id } });
    }

    async changePasswordByDev(appid: number, changeUserPwdByDevDto: ChangeUserPwdByDevDto) {
        const user = await this.findByAppidAndId(appid, changeUserPwdByDevDto.id);
        if (user) {
            const salt = CryptoUtils.makeSalt();
            const password = CryptoUtils.encryptPassword(changeUserPwdByDevDto.password, salt);
            await this.userRepository.update(user.id, { salt, password, rawPassword: changeUserPwdByDevDto.password });
            return user;
        }
        throw new NotAcceptableException('用户不存在');
    }

    async addTimeByDev(appid: number, addUserTimeDto: AddUserTimeDto) {
        if (addUserTimeDto.minutes === 0) {
            throw new NotAcceptableException('操作失败');
        }
        if (addUserTimeDto.minutes < 0) {
            return await this.subExpirationTime(addUserTimeDto.ids, -addUserTimeDto.minutes, '管理员操作', true, (query) => {
                query.andWhere('appid = :appid', { appid });
            });
        } else {
            return await this.addExpirationTime(addUserTimeDto.ids, addUserTimeDto.minutes, '管理员操作', (query) => {
                query.andWhere('appid = :appid', { appid });
            });
        }
    }

    async addBanlanceByDev(appid: number, addUserBanlanceDto: AddUserBanlanceDto) {
        if (addUserBanlanceDto.money === 0) {
            throw new NotAcceptableException('操作失败');
        }
        if (addUserBanlanceDto.money < 0) {
            return await this.subBanlance(addUserBanlanceDto.ids, -addUserBanlanceDto.money, '管理员操作', true, (query) => {
                query.andWhere('appid = :appid', { appid });
            });
        } else {
            return await this.addBanlance(addUserBanlanceDto.ids, addUserBanlanceDto.money, '管理员操作', (query) => {
                query.andWhere('appid = :appid', { appid });
            });
        }
    }

    async setUnbindCount(id: number, count: number) {
        await this.userRepository.update(id, { unbindCount: count });
    }

    async setCurrentDeviceIdByIds(ids: Array<number>, deviceId: string, whereCallback?: (query: UpdateQueryBuilder<User>) => void) {
        const query = this.userRepository.createQueryBuilder().update().set({ currentDeviceId: deviceId }).where('id in (:...ids)', { ids });
        if (whereCallback) {
            whereCallback(query);
        }
        const result = await query.execute();
        if (result.affected > 0) {
            return result.affected;
        }
        throw new NotAcceptableException('操作失败');
    }

    async setUnbindCountByIds(ids: Array<number>, count: number, whereCallback?: (query: UpdateQueryBuilder<User>) => void) {
        const query = this.userRepository.createQueryBuilder().update().set({ unbindCount: count }).where('id in (:...ids)', { ids });
        if (whereCallback) {
            whereCallback(query);
        }
        const result = await query.execute();
        if (result.affected > 0) {
            return result.affected;
        }
        throw new NotAcceptableException('操作失败');
    }

    async setStatusByIds(ids: Array<number>, status: UserStatus, whereCallback?: (query: UpdateQueryBuilder<User>) => void) {
        const query = this.userRepository.createQueryBuilder().update().set({ status }).where('id in (:...ids)', { ids });
        if (whereCallback) {
            whereCallback(query);
        }
        const result = await query.execute();
        if (result.affected > 0) {
            return result.affected;
        }
        throw new NotAcceptableException('操作失败');
    }

    async recharge(user: User, dto: UserRechargeDto) {
        const card = await this.rechargeCardService.findByCard(user.appid, dto.card);
        if (!card || card.status !== 'unused') {
            throw new NotAcceptableException('未找到该充值卡或已使用');
        }
        if (card.password && card.password !== dto.password) {
            throw new NotAcceptableException('充值卡密码错误');
        }
        try {
            await this.entityManager.transaction(async (manager) => {
                const result = await manager
                    .createQueryBuilder()
                    .update(RechargeCard)
                    .set({ status: 'used', user: user.id, useTime: new Date(), userName: user.name, ver: card.ver + 1 })
                    .where('id = :id', { id: card.id })
                    .andWhere('status = :status', { status: 'unused' })
                    .andWhere('ver = :ver', { ver: card.ver })
                    .execute();
                if (result.affected <= 0) {
                    throw new InternalServerErrorException('系统异常');
                }
                if (card.time > 0 && card.money > 0) {
                    await this.addBanlanceAndExpirationTime(user, card.time, card.money, '充值卡充值', manager.getRepository(User));
                } else {
                    if (card.time > 0) {
                        await this.addExpirationTime(user, card.time, '充值卡充值', undefined, manager.getRepository(User));
                    }
                    if (card.money > 0) {
                        await this.addBanlance(user, card.money, '充值卡充值', undefined, manager.getRepository(User));
                    }
                }
            });
        } catch (error) {
            throw new InternalServerErrorException('操作失败，系统错误');
        }
    }

    async validateUserAuthForToken(app: Application, token: string, deviceId: string) {
        if (!token) {
            throw new NotAcceptableException('未登录');
        }
        try {
            const decode = this.jwtService.verify(token);
            if (!(decode.roles as Array<string>).includes(Role.User)) {
                throw new NotAcceptableException('未登录');
            }
            const user = (await this.findById(decode.id)) as User;
            if (!user || user.appid !== app.id) {
                throw new NotAcceptableException('未登录');
            }
            if (user.status !== 'normal') {
                throw new NotAcceptableException('用户已被禁用');
            }
            if (!this.validateUserAuthForDate(user, app).result) {
                throw new NotAcceptableException('已到期');
            }
            return user;
        } catch (error) {
            throw new NotAcceptableException('未登录');
        }
    }

    async incUnbindCount(userId: number, count: number) {
        await this.userRepository.update(userId, { unbindCount: () => `unbindCount + ${count}` });
    }

    async deleteByIds(developerId: number, ids: Array<number>) {
        const result = await this.userRepository.delete({ id: In(ids), developerId });
        // 连带删除用户数据
        await (this.userDataService.getRepo() as Repository<UserData>).delete({ userId: In(ids), developerId });
        // 删除用户财产动态记录
        await (this.userFinancialService.getRepo() as Repository<UserFinancial>).delete({ userId: In(ids), developerId });
        return result.affected;
    }
}
