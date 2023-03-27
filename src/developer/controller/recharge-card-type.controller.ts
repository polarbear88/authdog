import { Body, Controller, Get, NotFoundException, Post, UseGuards } from '@nestjs/common';
import { Application } from 'src/application/application.entity';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CreateRechargeCardTypeDto, DeleteRechargeCardTypeDto, UpdateRechargeCardTypeDto } from 'src/recharge-card/card-type/recharge-card-type.dto';
import { RechargeCardTypeService } from 'src/recharge-card/card-type/recharge-card-type.service';
import { WriteDeveloperActionLog } from '../action-log/write-developer-action-log.decorator';
import { TakeApplication } from '../decorator/take-application.decorator';
import { AppActionGuard } from '../guard/app-action.guard';

@UseGuards(AppActionGuard)
@Roles(Role.Developer)
@Controller({ version: '1', path: 'recharge-card/type' })
export class RechargeCardTypeController extends BaseController {
    constructor(private rechargeCardTypeService: RechargeCardTypeService) {
        super();
    }

    @WriteDeveloperActionLog('创建充值卡类型')
    @Post('create')
    async create(@TakeApplication() app: Application, @Body() createRechargeCardTypeDto: CreateRechargeCardTypeDto) {
        const rechargeCardType = await this.rechargeCardTypeService.create(app.id, createRechargeCardTypeDto);
        return this.setAffected({}, rechargeCardType.name);
    }

    @Get('list')
    async list(@TakeApplication() app: Application) {
        return this.rechargeCardTypeService.getList(app.id);
    }

    @WriteDeveloperActionLog('删除充值卡类型')
    @Post('delete')
    async delete(@TakeApplication() app: Application, @Body() deleteRechargeCardTypeDto: DeleteRechargeCardTypeDto) {
        const rechargeCardType = await this.rechargeCardTypeService.findByAppidAndId(app.id, deleteRechargeCardTypeDto.id);
        if (!rechargeCardType) {
            throw new NotFoundException('充值卡类型不存在');
        }
        await this.rechargeCardTypeService.delete(app.id, deleteRechargeCardTypeDto.id);
        return this.setAffected({}, rechargeCardType.name);
    }

    @WriteDeveloperActionLog('更新充值卡类型')
    @Post('update')
    async update(@TakeApplication() app: Application, @Body() updateRechargeCardTypeDto: UpdateRechargeCardTypeDto) {
        const rechargeCardType = await this.rechargeCardTypeService.update(app.id, updateRechargeCardTypeDto);
        return this.setAffected({}, rechargeCardType.name);
    }
}
