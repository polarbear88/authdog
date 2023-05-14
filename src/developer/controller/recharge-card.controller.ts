import { Body, Controller, NotAcceptableException, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Application } from 'src/provide/application/application.entity';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { RechargeCardTypeService } from 'src/provide/recharge-card/card-type/recharge-card-type.service';
import {
    DeveloperCreateRechargeCardDto,
    ExportRechargeCardListDto,
    GetRechargeCardListDto,
    RechargeCardDeleteByCardsDto,
    RechargeCardDeleteDto,
    RechargeCardExportDto,
    RechargeCardQueryByCardsDto,
    RechargeCardReBuildByCardsDto,
    RechargeCardReBuildDto,
    RechargeCardRetrieveByCardsDto,
    RechargeCardSetStatusByCardsDto,
    RechargeCardSetStatusDto,
} from 'src/provide/recharge-card/recharge-card.dto';
import { RechargeCard } from 'src/provide/recharge-card/recharge-card.entity';
import { RechargeCardService } from 'src/provide/recharge-card/recharge-card.service';
import { RechargeCardStatus } from 'src/provide/recharge-card/recharge-card.type';
import { DeleteQueryBuilder, SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm';
import { WriteDeveloperActionLog } from '../action-log/write-developer-action-log.decorator';
import { TakeApplication } from '../decorator/take-application.decorator';
import { AppActionGuard } from '../guard/app-action.guard';
import { DeviceService } from 'src/user/device/device.service';
import { UserService } from 'src/user/user/user.service';
import { User } from 'src/user/user/user.entity';
import { Device } from 'src/user/device/device.entity';

@UseGuards(AppActionGuard)
@Roles(Role.Developer)
@Controller({ version: '1', path: 'recharge-card' })
export class RechargeCardController extends BaseController {
    constructor(
        private rechargeCardService: RechargeCardService,
        private rechargeCardTypeService: RechargeCardTypeService,
        private userService: UserService,
        private deviceService: DeviceService,
    ) {
        super();
    }

    @WriteDeveloperActionLog('生产充值卡')
    @Post('create')
    async createRechargeCard(@TakeApplication() app: Application, @Body() developerCreateRechargeCardDto: DeveloperCreateRechargeCardDto) {
        const cardType = await this.rechargeCardTypeService.findByAppidAndId(app.id, developerCreateRechargeCardDto.typeId);
        if (!cardType) {
            throw new NotAcceptableException('充值卡类型不存在');
        }
        const cards = await this.rechargeCardService.createRechargeCard(
            app.developerId,
            app.id,
            cardType,
            developerCreateRechargeCardDto.description,
            0,
            '开发者',
            developerCreateRechargeCardDto.count,
            '0',
        );
        return this.setAffected({ cards }, `${cardType.name}[${developerCreateRechargeCardDto.count}]张`);
    }

    @Post('list')
    async getList(@TakeApplication() app: Application, @Body() dto: GetRechargeCardListDto) {
        return await this.rechargeCardService.getListForDeveloper(app.id, dto);
    }

    @WriteDeveloperActionLog('设置充值卡状态')
    @Post('set-status')
    async setStatus(@TakeApplication() app: Application, @Body() dto: RechargeCardSetStatusDto) {
        const affected = await this.rechargeCardService.setStatusByIds(
            dto.ids,
            dto.status as RechargeCardStatus,
            (query: UpdateQueryBuilder<RechargeCard>) => {
                query.andWhere('appid = :appid', { appid: app.id });
                query.andWhere("status != 'used'");
            },
        );
        return this.setAffected({ affectedCount: affected }, `操作${affected}张卡[${dto.status}]`);
    }

    @WriteDeveloperActionLog('重新构建卡号')
    @Post('rebuild')
    async rebuild(@TakeApplication() app: Application, @Body() dto: RechargeCardReBuildDto) {
        const affected = await this.rechargeCardService.rebuildCardByIds(dto.ids, (query: UpdateQueryBuilder<RechargeCard>) => {
            query.andWhere('appid = :appid', { appid: app.id });
            query.andWhere("status != 'used'");
        });
        return this.setAffected({ affectedCount: affected }, `操作${affected}张卡`);
    }

    @WriteDeveloperActionLog('删除充值卡')
    @Post('delete')
    async delete(@TakeApplication() app: Application, @Body() dto: RechargeCardDeleteDto) {
        const affected = await this.rechargeCardService.deleteByIds(dto.ids, (query: DeleteQueryBuilder<RechargeCard>) => {
            query.andWhere('appid = :appid', { appid: app.id });
        });
        return this.setAffected({ affectedCount: affected }, `操作${affected}张卡`);
    }

    @Post('export-by-ids')
    async exportByIds(@TakeApplication() app: Application, @Body() dto: RechargeCardExportDto) {
        return await this.rechargeCardService.exportByIds(dto.ids, (query: SelectQueryBuilder<RechargeCard>) => {
            query.andWhere('appid = :appid', { appid: app.id });
        });
    }

    @Throttle(10, 180)
    @Post('export-by-eligible')
    async exportByEligible(@TakeApplication() app: Application, @Body() dto: ExportRechargeCardListDto) {
        return await this.rechargeCardService.exportByEligibleByDeveloper(app.id, dto);
    }

    @WriteDeveloperActionLog('设置充值卡状态')
    @Post('set-status-by-cards')
    async setStatusByCards(@TakeApplication() app: Application, @Body() dto: RechargeCardSetStatusByCardsDto) {
        const affected = await this.rechargeCardService.setStatusByCards(
            app.id,
            dto.cards,
            dto.status as RechargeCardStatus,
            (query: UpdateQueryBuilder<RechargeCard>) => {
                query.andWhere("status != 'used'");
            },
        );
        return this.setAffected({ affectedCount: affected }, `操作${affected}张卡[${dto.status}]`);
    }

    @WriteDeveloperActionLog('重新构建卡号')
    @Post('rebuild-by-cards')
    async rebuildByCards(@TakeApplication() app: Application, @Body() dto: RechargeCardReBuildByCardsDto) {
        const affected = await this.rechargeCardService.rebuildCardByCards(
            app.id,
            dto.cards,
            dto.description,
            (query: UpdateQueryBuilder<RechargeCard>) => {
                query.andWhere("status != 'used'");
            },
        );
        return this.setAffected({ affectedCount: affected }, `操作${affected}张卡`);
    }

    @WriteDeveloperActionLog('删除充值卡')
    @Post('delete-by-cards')
    async deleteByCards(@TakeApplication() app: Application, @Body() dto: RechargeCardDeleteByCardsDto) {
        const affected = await this.rechargeCardService.deleteByCards(app.id, dto.cards);
        return this.setAffected({ affectedCount: affected }, `操作${affected}张卡`);
    }

    @Post('find-by-cards')
    async findByCards(@TakeApplication() app: Application, @Body() dto: RechargeCardQueryByCardsDto) {
        return await this.rechargeCardService.findByCards(app.id, dto.cards);
    }

    @WriteDeveloperActionLog('追回充值卡')
    @Post('retrieve-by-cards')
    async retrieveByCards(@TakeApplication() app: Application, @Body() dto: RechargeCardRetrieveByCardsDto) {
        const cards = await this.rechargeCardService.findByCards(app.id, dto.cards);
        const uService = app.authMode === 'user' ? this.userService : this.deviceService;
        for (const card of cards) {
            (card as any).retrieve = false;
            if (card.status === 'used') {
                const user: User | Device = (await uService.findById(card.user)) as User | Device;
                if (!user) {
                    continue;
                }
                if (card.money > 0) {
                    try {
                        await uService.subBanlance(user as any, card.money, dto.reason, true);
                    } catch (e: any) {
                        //
                    }
                }
                if (card.time > 0) {
                    try {
                        await uService.subExpirationTime(user as any, card.time, dto.reason, true);
                    } catch (error) {
                        //
                    }
                }
                (card as any).retrieve = true;
            }
        }
        return cards;
    }
}
