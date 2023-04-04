import { Body, Controller, Post } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { DeveloperActionLogService } from '../action-log/developer-action-log.service';
import { TakeDeveloper } from '../decorator/take-developer.decorator';
import { GetPageDto } from 'src/common/dto/get-page.dto';

@Roles(Role.Developer)
@Controller({ version: '1', path: 'action-log' })
export class ActionLogController extends BaseController {
    constructor(private actionLogService: DeveloperActionLogService) {
        super();
    }

    @Post('list')
    async getList(@TakeDeveloper() developer: any, @Body() dto: GetPageDto) {
        return await this.actionLogService.getList(developer.id, dto);
    }
}
