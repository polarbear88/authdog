import { Controller, Get } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { TakeSaler } from '../take-saler.decorator';
import { SalerService } from 'src/saler/saler.service';
import { RechargeCardService } from 'src/recharge-card/recharge-card.service';

@Roles(Role.Saler)
@Controller({ version: '1', path: 'statistics' })
export class StatisticsController extends BaseController {
    constructor(private salerService: SalerService, private rechargeCardService: RechargeCardService) {
        super();
    }

    @Get('base')
    async getBaseStatistics(@TakeSaler() saler: any) {
        const data: any = {};
        data.subordinateCount = await this.salerService.count({ parentId: saler.id });
        data.unusedCardCount = await this.rechargeCardService.count({ creator: saler.id, status: 'unused' });
        return data;
    }
}
