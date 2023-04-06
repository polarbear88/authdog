import { Body, Controller, Post } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { FundFlowGetListDto } from 'src/provide/fund-flow/fund-flow.dto';
import { FundFlowService } from 'src/provide/fund-flow/fund-flow.service';
import { TakeSaler } from '../take-saler.decorator';
import { Saler } from 'src/saler/saler/saler.entity';
import { ParseSalerPipe } from '../parse-saler.pipe';

@Roles(Role.Saler)
@Controller({ version: '1', path: 'fund-flow' })
export class FundFlowController extends BaseController {
    constructor(private fundFlowService: FundFlowService) {
        super();
    }

    @Post('list')
    async list(@TakeSaler(ParseSalerPipe) saler: Saler, @Body() dto: FundFlowGetListDto) {
        return this.fundFlowService.getList(saler.developerId, saler.id, dto);
    }
}
