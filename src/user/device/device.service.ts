import { Injectable, InternalServerErrorException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from 'src/provide/application/application.entity';
import { IPAddrAscriptionPlace } from 'src/common/dto/ipaddr-ascription-place';
import { PaginationUtils } from 'src/common/pagination/pagination.utils';
import { BaseService } from 'src/common/service/base.service';
import { DateUtils } from 'src/common/utils/date.utils';
import { EntityUtils } from 'src/common/utils/entity.utils';
import { StringUtils } from 'src/common/utils/string.utils';
import { RechargeCard } from 'src/provide/recharge-card/recharge-card.entity';
import { RechargeCardService } from 'src/provide/recharge-card/recharge-card.service';
import { UserFinancialService } from 'src/user/user-financial/user-financial.service';
import { UserStatus } from 'src/user/user/user.type';
import { EntityManager, Repository, SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm';
import { AddDeviceBanlanceDto, AddDeviceTimeDto, DeviceDto, DeviceRechargeDto, GetDeviceListDto } from './device.dto';
import { Device } from './device.entity';
import { UserFinancial } from 'src/user/user-financial/user-financial.entity';

@Injectable()
export class DeviceService extends BaseService {
    constructor(
        @InjectRepository(Device)
        private deviceRepository: Repository<Device>,
        private userFinancialService: UserFinancialService,
        private rechargeCardService: RechargeCardService,
        private readonly entityManager: EntityManager,
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
        device.developerId = app.developerId;
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

    async getList(appid: number, dto: GetDeviceListDto) {
        const data = await super.getPage(PaginationUtils.objectToDto(dto, new GetDeviceListDto()), [['appid = :appid', { appid }]], 'id', 'DESC');
        return {
            total: data[1],
            list: EntityUtils.serializationEntityArr(data[0], true, ['ip']),
        };
    }

    async subUserBalanceAndExpirationTime(device: Device, minute: number, balance: number, reason: string) {
        const affected = await this.deviceRepository
            .createQueryBuilder()
            .where('id = :id', { id: device.id })
            .andWhere('ver = :ver', { ver: device.ver })
            .andWhere(`DATE_SUB(expirationTime, INTERVAL ${minute} MINUTE) >= NOW()`)
            .andWhere(`balance >= ${balance}`)
            .update({
                expirationTime: () => `DATE_SUB(expirationTime, INTERVAL ${minute} MINUTE)`,
                balance: () => `balance - ${balance}`,
                ver: () => 'ver + 1',
            })
            .execute();
        if (affected.affected > 0) {
            await this.userFinancialService.createSubUserTime(device, minute, reason, DateUtils.formatDateTime(device.expirationTime));
            await this.userFinancialService.createSubUserBalance(device, balance, reason, device.balance + '');
            return true;
        }
        throw new NotAcceptableException('操作失败');
    }

    async subBanlance(
        device: Device | Array<number>,
        balance: number,
        reason: string,
        force = false,
        whereCallback?: (query: SelectQueryBuilder<Device>) => void,
    ) {
        const query = this.deviceRepository.createQueryBuilder();
        if (Array.isArray(device)) {
            query.where('id in (:...ids)', { ids: device });
        } else {
            query.where('id = :id', { id: device.id }).andWhere('ver = :ver', { ver: device.ver });
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
            if (!Array.isArray(device)) {
                await this.userFinancialService.createSubUserBalance(device, balance, reason, device.balance + '');
            }
            return affected.affected;
        }
        throw new NotAcceptableException('操作失败，可能次数不足');
    }

    async subExpirationTime(
        device: Device | Array<number>,
        minute: number,
        reason: string,
        force = false,
        whereCallback?: (query: SelectQueryBuilder<Device>) => void,
    ) {
        const query = this.deviceRepository.createQueryBuilder();
        if (Array.isArray(device)) {
            query.where('id in (:...ids)', { ids: device });
        } else {
            query.where('id = :id', { id: device.id });
            query.andWhere('ver = :ver', { ver: device.ver });
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
            if (!Array.isArray(device)) {
                await this.userFinancialService.createSubUserTime(device, minute, reason, DateUtils.formatDateTime(device.expirationTime));
            }
            return affected.affected;
        }
        throw new NotAcceptableException('操作失败');
    }

    async addBanlance(
        device: Device | Array<number>,
        balance: number,
        reason: string,
        whereCallback?: (query: SelectQueryBuilder<Device>) => void,
        manager?: Repository<Device>,
    ) {
        const mgr = manager || this.deviceRepository;
        const query = mgr.createQueryBuilder();
        if (Array.isArray(device)) {
            query.where('id in (:...ids)', { ids: device });
        } else {
            query.where('id = :id', { id: device.id }).andWhere('ver = :ver', { ver: device.ver });
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
            if (!Array.isArray(device)) {
                await this.userFinancialService.createAddUserBalance(
                    device,
                    balance,
                    reason,
                    device.balance + '',
                    undefined,
                    manager.manager.getRepository(UserFinancial),
                );
            }
            return affected.affected;
        }
        throw new NotAcceptableException('操作失败');
    }

    async addExpirationTime(
        device: Device | Array<number>,
        minute: number,
        reason: string,
        whereCallback?: (query: SelectQueryBuilder<Device>) => void,
        manager?: Repository<Device>,
    ) {
        const mgr = manager || this.deviceRepository;
        const query = mgr.createQueryBuilder();
        if (Array.isArray(device)) {
            query.where('id in (:...ids)', { ids: device });
        } else {
            query.where('id = :id', { id: device.id }).andWhere('ver = :ver', { ver: device.ver });
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
            if (!Array.isArray(device)) {
                await this.userFinancialService.createAddUserTime(
                    device,
                    minute,
                    reason,
                    DateUtils.formatDateTime(device.expirationTime),
                    undefined,
                    manager.manager.getRepository(UserFinancial),
                );
            }
            return affected.affected;
        }
        throw new NotAcceptableException('操作失败');
    }

    async addBanlanceAndExpirationTime(device: Device, minute: number, balance: number, reason: string, manager?: Repository<Device>) {
        const mgr = manager || this.deviceRepository;
        const affected = await mgr
            .createQueryBuilder()
            .where('id = :id', { id: device.id })
            .andWhere('ver = :ver', { ver: device.ver })
            .update({
                expirationTime: () => `DATE_ADD(GREATEST(expirationTime, NOW()), INTERVAL ${minute} MINUTE)`,
                balance: () => `balance + ${balance}`,
                ver: () => 'ver + 1',
            })
            .execute();
        if (affected.affected > 0) {
            await this.userFinancialService.createAddUserTime(
                device,
                minute,
                reason,
                DateUtils.formatDateTime(device.expirationTime),
                undefined,
                manager.manager.getRepository(UserFinancial),
            );
            await this.userFinancialService.createAddUserBalance(
                device,
                balance,
                reason,
                device.balance + '',
                undefined,
                manager.manager.getRepository(UserFinancial),
            );
            return true;
        }
        throw new NotAcceptableException('操作失败');
    }

    async addTimeByDev(appid: number, addDeviceTimeDto: AddDeviceTimeDto) {
        if (addDeviceTimeDto.minutes === 0) {
            throw new NotAcceptableException('操作失败');
        }
        if (addDeviceTimeDto.minutes < 0) {
            return await this.subExpirationTime(addDeviceTimeDto.ids, -addDeviceTimeDto.minutes, '管理员操作', true, (query) => {
                query.andWhere('appid = :appid', { appid });
            });
        } else {
            return await this.addExpirationTime(addDeviceTimeDto.ids, addDeviceTimeDto.minutes, '管理员操作', (query) => {
                query.andWhere('appid = :appid', { appid });
            });
        }
    }

    async addBanlanceByDev(appid: number, addDeviceBanlanceDto: AddDeviceBanlanceDto) {
        if (addDeviceBanlanceDto.money === 0) {
            throw new NotAcceptableException('操作失败');
        }
        if (addDeviceBanlanceDto.money < 0) {
            return await this.subBanlance(addDeviceBanlanceDto.ids, -addDeviceBanlanceDto.money, '管理员操作', true, (query) => {
                query.andWhere('appid = :appid', { appid });
            });
        } else {
            return await this.addBanlance(addDeviceBanlanceDto.ids, addDeviceBanlanceDto.money, '管理员操作', (query) => {
                query.andWhere('appid = :appid', { appid });
            });
        }
    }

    async setStatusByIds(ids: Array<number>, status: UserStatus, whereCallback?: (query: UpdateQueryBuilder<Device>) => void) {
        const query = this.deviceRepository.createQueryBuilder().update().set({ status }).where('id in (:...ids)', { ids });
        if (whereCallback) {
            whereCallback(query);
        }
        const result = await query.execute();
        if (result.affected > 0) {
            return result.affected;
        }
        throw new NotAcceptableException('操作失败');
    }

    async recharge(device: Device, dto: DeviceRechargeDto) {
        const card = await this.rechargeCardService.findByCard(device.appid, dto.card);
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
                    .set({ status: 'used', user: device.id, useTime: new Date(), userName: device.deviceId, ver: card.ver + 1 })
                    .where('id = :id', { id: card.id })
                    .andWhere('status = :status', { status: 'unused' })
                    .andWhere('ver = :ver', { ver: card.ver })
                    .execute();
                if (result.affected <= 0) {
                    throw new InternalServerErrorException('系统异常');
                }
                if (card.time > 0 && card.money > 0) {
                    await this.addBanlanceAndExpirationTime(device, card.time, card.money, '充值卡充值', manager.getRepository(Device));
                } else {
                    if (card.time > 0) {
                        await this.addExpirationTime(device, card.time, '充值卡充值', undefined, manager.getRepository(Device));
                    }
                    if (card.money > 0) {
                        await this.addBanlance(device, card.money, '充值卡充值', undefined, manager.getRepository(Device));
                    }
                }
            });
        } catch (error) {
            throw new InternalServerErrorException('操作失败，系统错误');
        }
    }
}
