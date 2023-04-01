import { Body, Controller, Get, NotAcceptableException, Post, Query } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { NumberUtils } from 'src/common/utils/number.utils';
import { RechargeCardType } from 'src/recharge-card/card-type/recharge-card-type.entity';
import { RechargeCardTypeService } from 'src/recharge-card/card-type/recharge-card-type.service';
import { SalerCreateRechargeCardDto } from 'src/recharge-card/recharge-card.dto';
import { Saler } from 'src/saler/saler.entity';
import { SalerService } from 'src/saler/saler.service';
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
}
