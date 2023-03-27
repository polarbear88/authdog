import { Body, Controller, NotAcceptableException, Post, Req, UseGuards } from '@nestjs/common';
import { Application } from 'src/application/application.entity';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { RechargeCardTypeService } from 'src/recharge-card/card-type/recharge-card-type.service';
import { DeveloperCreateRechargeCardDto } from 'src/recharge-card/recharge-card.dto';
import { RechargeCardService } from 'src/recharge-card/recharge-card.service';
import { WriteDeveloperActionLog } from '../action-log/write-developer-action-log.decorator';
import { TakeApplication } from '../decorator/take-application.decorator';
import { AppActionGuard } from '../guard/app-action.guard';

@UseGuards(AppActionGuard)
@Roles(Role.Developer)
@Controller({ version: '1', path: 'recharge-card' })
export class RechargeCardController extends BaseController {
    constructor(private rechargeCardService: RechargeCardService, private rechargeCardTypeService: RechargeCardTypeService) {
        super();
    }

    @WriteDeveloperActionLog('生产充值卡')
    @Post('create')
    async createRechargeCard(
        @TakeApplication() app: Application,
        @Body() developerCreateRechargeCardDto: DeveloperCreateRechargeCardDto,
        @Req() req: any,
    ) {
        const cardType = await this.rechargeCardTypeService.findByAppidAndId(app.id, developerCreateRechargeCardDto.typeId);
        if (!cardType) {
            throw new NotAcceptableException('充值卡类型不存在');
        }
        const cards = await this.rechargeCardService.createRechargeCard(
            app.id,
            cardType,
            developerCreateRechargeCardDto.desc,
            req.user.id,
            req.user.username,
            developerCreateRechargeCardDto.count,
        );
        return this.setAffected({ cards }, `${cardType.name}[${developerCreateRechargeCardDto.count}]张`);
    }
}
