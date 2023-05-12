import { Body, Controller, Post } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { GetRechargeRecordListDto } from 'src/provide/recharge-record/recharge-record.dto';
import { RechargeRecordService } from 'src/provide/recharge-record/recharge-record.service';
import { Saler } from 'src/saler/saler/saler.entity';
import { TakeSaler } from '../take-saler.decorator';
import { ParseSalerPipe } from '../parse-saler.pipe';

@Roles(Role.Saler)
@Controller({ version: '1', path: 'recharge-record' })
export class RechargeRecordController extends BaseController {
    constructor(private rechargeRecordService: RechargeRecordService) {
        super();
    }

    @Post('getList')
    async getList(@Body() dto: GetRechargeRecordListDto, @TakeSaler(ParseSalerPipe) saler: Saler) {
        return await this.rechargeRecordService.getList(saler.developerId, saler.id, dto);
    }
}
