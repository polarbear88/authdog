import { Body, Controller, Post } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { TakeDeveloper } from '../decorator/take-developer.decorator';
import { UserFinancialService } from 'src/user/user-financial/user-financial.service';
import { UserFinancialGetListDto } from 'src/user/user-financial/user-financial.dto';

@Roles(Role.Developer)
@Controller({ version: '1', path: 'user-financial' })
export class UserFinancialController extends BaseController {
    constructor(private userFinancialService: UserFinancialService) {
        super();
    }

    @Post('list')
    async list(@TakeDeveloper() developer: any, @Body() dto: UserFinancialGetListDto) {
        return this.userFinancialService.getList(developer.id, dto);
    }
}
