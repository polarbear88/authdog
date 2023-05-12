import { Body, Controller, Post } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { GetRechargeRecordListDto } from 'src/provide/recharge-record/recharge-record.dto';
import { RechargeRecordService } from 'src/provide/recharge-record/recharge-record.service';
import { TakeDeveloper } from '../decorator/take-developer.decorator';

@Roles(Role.Developer)
@Controller({ version: '1', path: 'recharge-record' })
export class RechargeRecordController extends BaseController {
    constructor(private rechargeRecordService: RechargeRecordService) {
        super();
    }

    @Post('getList')
    async getList(@Body() dto: GetRechargeRecordListDto, @TakeDeveloper() developer: any) {
        return await this.rechargeRecordService.getList(developer.id, 0, dto);
    }
}
