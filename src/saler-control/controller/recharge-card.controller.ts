import { Body, Controller, Get, NotAcceptableException, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { NumberUtils } from 'src/common/utils/number.utils';
import { RechargeCardType } from 'src/recharge-card/card-type/recharge-card-type.entity';
import { RechargeCardTypeService } from 'src/recharge-card/card-type/recharge-card-type.service';
import {
    ExportRechargeCardListDto,
    GetRechargeCardListDto,
    RechargeCardExportDto,
    RechargeCardQueryByCardsSalerDto,
    RechargeCardReBuildByCardsSalerDto,
    RechargeCardReBuildDto,
    RechargeCardSetStatusByCardsSalerDto,
    RechargeCardSetStatusDto,
    SalerCreateRechargeCardDto,
} from 'src/recharge-card/recharge-card.dto';
import { RechargeCard } from 'src/recharge-card/recharge-card.entity';
import { RechargeCardService } from 'src/recharge-card/recharge-card.service';
import { RechargeCardStatus } from 'src/recharge-card/recharge-card.type';
import { Saler } from 'src/saler/saler.entity';
import { SalerService } from 'src/saler/saler.service';
import { SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm';
import { ParseSalerPipe } from '../parse-saler.pipe';
import { SalerControlService } from '../saler-control.service';
import { TakeSaler } from '../take-saler.decorator';

@Roles(Role.Saler)
@Controller({ version: '1', path: 'recharge-card' })
export class RechargeCardController extends BaseController {
    constructor(
        private salerService: SalerService,
        private rechargeCardTypeService: RechargeCardTypeService,
        private salerControlService: SalerControlService,
        private rechargeCardService: RechargeCardService,
    ) {
        super();
    }

    @Get('get-app-list')
    async getAppList(@TakeSaler(ParseSalerPipe) saler: Saler) {
        const topSaler = saler.topSalerId ? ((await this.salerService.findById(saler.topSalerId)) as Saler) : saler;
        return topSaler.apps;
    }

    @Get('get-recharge-card-type')
    async getRechargeCardType(@TakeSaler(ParseSalerPipe) saler: Saler, @Query('appid') appid: number) {
        appid = Number(appid);
        if (isNaN(appid)) throw new NotAcceptableException('应用不存在');
        await this.salerService.checkSalerAppPermission(saler, appid);
        const typrList = await this.rechargeCardTypeService.getList(appid);
        return typrList.map((type) => {
            return {
                id: type.id,
                name: type.name,
            };
        });
    }

    @Get('get-recharge-card-price')
    async getRechargeCardPrice(@TakeSaler(ParseSalerPipe) saler: Saler, @Query('appid') appid: number, @Query('typeid') typeid: number) {
        appid = Number(appid);
        if (isNaN(appid)) throw new NotAcceptableException('应用不存在');
        typeid = Number(typeid);
        if (isNaN(typeid)) throw new NotAcceptableException('卡类型不存在');
        await this.salerService.checkSalerAppPermission(saler, appid);
        const cardType = (await this.rechargeCardTypeService.findById(typeid)) as RechargeCardType;
        if (!cardType || cardType.appid !== appid) {
            throw new NotAcceptableException('充值卡类型不存在');
        }
        const price = await this.salerService.getRechargeCardTypePrice(saler, cardType);
        return {
            price: NumberUtils.toFixedTwo(price.price),
        };
    }

    @Post('create')
    async create(@TakeSaler(ParseSalerPipe) saler: Saler, @Body() dto: SalerCreateRechargeCardDto) {
        await this.salerService.checkSalerAppPermission(saler, dto.appid);
        const cardType = (await this.rechargeCardTypeService.findById(dto.typeId)) as RechargeCardType;
        if (!cardType || cardType.appid !== dto.appid) {
            throw new NotAcceptableException('充值卡类型不存在');
        }
        const cards = await this.salerControlService.createRechargeCardBySaler(dto, saler, cardType);
        return {
            cards,
        };
    }

    @Post('list')
    async getList(@TakeSaler() saler: any, @Body() dto: GetRechargeCardListDto) {
        return await this.rechargeCardService.getListForSaler(saler.id, dto);
    }

    @Post('set-status')
    async setStatus(@TakeSaler() saler: any, @Body() dto: RechargeCardSetStatusDto) {
        const affected = await this.rechargeCardService.setStatusByIds(
            dto.ids,
            dto.status as RechargeCardStatus,
            (query: UpdateQueryBuilder<RechargeCard>) => {
                query.andWhere('creator = :creator', { creator: saler.id });
                query.andWhere("status != 'used'");
            },
        );
        return { affectedCount: affected };
    }

    @Post('rebuild')
    async rebuild(@TakeSaler() saler: any, @Body() dto: RechargeCardReBuildDto) {
        const affected = await this.rechargeCardService.rebuildCardByIds(dto.ids, (query: UpdateQueryBuilder<RechargeCard>) => {
            query.andWhere('creator = :creator', { creator: saler.id });
            query.andWhere("status != 'used'");
        });
        return { affectedCount: affected };
    }

    @Post('export-by-ids')
    async exportByIds(@TakeSaler() saler: any, @Body() dto: RechargeCardExportDto) {
        return await this.rechargeCardService.exportByIds(dto.ids, (query: SelectQueryBuilder<RechargeCard>) => {
            query.andWhere('creator = :creator', { creator: saler.id });
        });
    }

    @Throttle(10, 180)
    @Post('export-by-eligible')
    async exportByEligible(@TakeSaler() saler: any, @Body() dto: ExportRechargeCardListDto) {
        return await this.rechargeCardService.exportByEligibleBySaler(saler.id, dto);
    }

    @Post('set-status-by-cards')
    async setStatusByCards(@TakeSaler() saler: any, @Body() dto: RechargeCardSetStatusByCardsSalerDto) {
        const affected = await this.rechargeCardService.setStatusByCards(
            dto.appid,
            dto.cards,
            dto.status as RechargeCardStatus,
            (query: UpdateQueryBuilder<RechargeCard>) => {
                query.andWhere("status != 'used'");
                query.andWhere('creator = :creator', { creator: saler.id });
            },
        );
        return { affectedCount: affected };
    }

    @Post('rebuild-by-cards')
    async rebuildByCards(@TakeSaler() saler: any, @Body() dto: RechargeCardReBuildByCardsSalerDto) {
        const affected = await this.rechargeCardService.rebuildCardByCards(
            dto.appid,
            dto.cards,
            dto.description,
            (query: UpdateQueryBuilder<RechargeCard>) => {
                query.andWhere("status != 'used'");
                query.andWhere('creator = :creator', { creator: saler.id });
            },
        );
        return { affectedCount: affected };
    }

    @Post('find-by-cards')
    async findByCards(@TakeSaler() saler: any, @Body() dto: RechargeCardQueryByCardsSalerDto) {
        return await this.rechargeCardService.findByCards(dto.appid, dto.cards, (query: SelectQueryBuilder<RechargeCard>) => {
            query.andWhere('creator = :creator', { creator: saler.id });
        });
    }
}
