import { Body, Controller, Post } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { TakeDeveloper } from '../decorator/take-developer.decorator';
import { FundFlowGetListDto } from 'src/provide/fund-flow/fund-flow.dto';
import { FundFlowService } from 'src/provide/fund-flow/fund-flow.service';

@Roles(Role.Developer)
@Controller({ version: '1', path: 'fund-flow' })
export class FundFlowController extends BaseController {
    constructor(private fundFlowService: FundFlowService) {
        super();
    }

    @Post('list')
    async list(@TakeDeveloper() developer: any, @Body() dto: FundFlowGetListDto) {
        return this.fundFlowService.getList(developer.id, 0, dto);
    }
}
