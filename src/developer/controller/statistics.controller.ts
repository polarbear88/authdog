import { Controller, Get, NotAcceptableException, Query, UseInterceptors } from '@nestjs/common';
import { ApplicationService } from 'src/application/application.service';
import { CacheInterceptor } from 'src/cache.interceptor';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { TakeDeveloper } from '../decorator/take-developer.decorator';
import { ParseDeveloperPipe } from '../pipe/parse-developer.pipe';
import { Developer } from '../developer.entity';
import { SalerService } from 'src/saler/saler.service';
import { UserService } from 'src/user/user.service';
import { DeviceService } from 'src/device/device.service';
import { RechargeCardService } from 'src/recharge-card/recharge-card.service';
import { Raw, SelectQueryBuilder } from 'typeorm';
import { BaseEntity } from 'src/common/entity/base.entity';
import { CacheTTL } from 'src/common/decorator/caceh-ttl.decorator';
import { UserDeviceService } from 'src/user-device/user-device.service';
import { PeriodicStatisticsService } from 'src/periodic-statistics/periodic-statistics.service';
import { PeriodicStatisticsMatterEnum } from 'src/periodic-statistics/periodic-statistics.enum';

@Roles(Role.Developer)
@Controller({ version: '1', path: 'statistics' })
export class StatisticsController extends BaseController {
    constructor(
        private applicationService: ApplicationService,
        private salerService: SalerService,
        private userService: UserService,
        private deviceService: DeviceService,
        private rechargeCardService: RechargeCardService,
        private userDeviceService: UserDeviceService,
        private periodicStatisticsService: PeriodicStatisticsService,
    ) {
        super();
    }

    @UseInterceptors(CacheInterceptor)
    @Get('base')
    async getBaseStatistics(@TakeDeveloper(ParseDeveloperPipe) developer: Developer) {
        const data: any = {};
        data.income = developer.income;
        data.appCount = await this.applicationService.count({ developerId: developer.id });
        data.salerCount = await this.salerService.count({ developerId: developer.id });
        data.userCountByUserMode = await this.userService.count({ developerId: developer.id });
        data.userCountByDeviceMode = await this.deviceService.count({ developerId: developer.id });
        data.unusedRechargeCardCount = await this.rechargeCardService.count({ developerId: developer.id, status: 'unused' });
        data.activatedByUserMode = await this.userService.count({
            developerId: developer.id,
            expirationTime: Raw((expirationTime) => 'expirationTime > NOW()'),
        });
        data.activatedByDeviceMode = await this.deviceService.count({
            developerId: developer.id,
            expirationTime: Raw((expirationTime) => 'expirationTime > NOW()'),
        });
        return data;
    }

    @UseInterceptors(CacheInterceptor)
    @Get('lately')
    async getLatelyStatistics(@TakeDeveloper(ParseDeveloperPipe) developer: Developer, @Query('type') type: string) {
        let compareTime = 'CURDATE()';
        if (type === '30days') {
            compareTime = 'DATE_SUB(NOW(), INTERVAL 30 DAY)';
        }
        if (type === '7days') {
            compareTime = 'DATE_SUB(NOW(), INTERVAL 7 DAY)';
        }
        if (type === 'yesterday') {
            compareTime = 'CAST(CURDATE() - INTERVAL 1 DAY AS DATETIME)';
        }
        let query: SelectQueryBuilder<BaseEntity>;
        const data: any = {};
        query = this.userService
            .getRepo()
            .createQueryBuilder()
            .where('developerId = :developerId', { developerId: developer.id })
            .andWhere('createdAt >= ' + compareTime);
        if (type === 'yesterday') {
            query.andWhere('createdAt < CURDATE()');
        }
        data.userModeAdded = await query.getCount();
        query = this.deviceService
            .getRepo()
            .createQueryBuilder()
            .where('developerId = :developerId', { developerId: developer.id })
            .andWhere('createdAt >= ' + compareTime);
        if (type === 'yesterday') {
            query.andWhere('createdAt < CURDATE()');
        }
        data.deviceModeAdded = await query.getCount();
        query = this.rechargeCardService
            .getRepo()
            .createQueryBuilder()
            .where('developerId = :developerId', { developerId: developer.id })
            .andWhere('useTime >= ' + compareTime);
        if (type === 'yesterday') {
            query.andWhere('useTime < CURDATE()');
        }
        data.userRecharge = await query.getCount();
        query = this.userService
            .getRepo()
            .createQueryBuilder()
            .where('developerId = :developerId', { developerId: developer.id })
            .andWhere('lastLoginTime >= ' + compareTime);
        if (type === 'yesterday') {
            query.andWhere('lastLoginTime < CURDATE()');
        }
        data.active = await query.getCount();
        query = this.deviceService
            .getRepo()
            .createQueryBuilder()
            .where('developerId = :developerId', { developerId: developer.id })
            .andWhere('lastLoginTime >= ' + compareTime);
        if (type === 'yesterday') {
            query.andWhere('lastLoginTime < CURDATE()');
        }
        data.active += await query.getCount();
        return data;
    }

    @UseInterceptors(CacheInterceptor)
    @CacheTTL(300)
    @Get('user-area')
    async getUserAreaStatistics(@TakeDeveloper() developer: any) {
        return await this.userDeviceService.getAreaStatistics(developer.id);
    }

    @UseInterceptors(CacheInterceptor)
    @CacheTTL(300)
    @Get('user-brand')
    async getUserBrandStatistics(@TakeDeveloper() developer: any) {
        return await this.userDeviceService.getBrandStatistics(developer.id);
    }

    @Get('periodic')
    async getPeriodicStatistics(@TakeDeveloper() developer: any, @Query('type') type: string, @Query('time') time: string) {
        if (!(type in PeriodicStatisticsMatterEnum)) {
            throw new NotAcceptableException('type参数错误');
        }
        const startTime = new Date(time);
        if (isNaN(startTime.getTime())) {
            throw new NotAcceptableException('time参数错误');
        }
        if (new Date().getTime() - startTime.getTime() > 1000 * 60 * 60 * 24 * 40) {
            throw new NotAcceptableException('time参数错误');
        }
        return await this.periodicStatisticsService.getData(developer.id, type, startTime);
    }

    @UseInterceptors(CacheInterceptor)
    @CacheTTL(300)
    @Get('use-recharge-type')
    async getUseRechargeTypeStatistics(@TakeDeveloper() developer: any, @Query('type') type: string) {
        if (type !== '7days' && type !== '30days') {
            throw new NotAcceptableException('type参数错误');
        }
        const compareTime = type === '30days' ? 'DATE_SUB(NOW(), INTERVAL 30 DAY)' : 'DATE_SUB(NOW(), INTERVAL 7 DAY)';
        return await this.rechargeCardService
            .getRepo()
            .createQueryBuilder()
            .where('developerId = :developerId', { developerId: developer.id })
            .andWhere('useTime is not null')
            .andWhere('useTime >= ' + compareTime)
            .select(['cardTypeName as name', 'count(*) as value'])
            .groupBy('cardTypeName')
            .getRawMany();
    }
}
