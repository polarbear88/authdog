import { Body, Controller, Post } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { GetUserDataListByDeveloperDto, UserDataDeleteByIdsDto } from 'src/provide/user-data/user-data.dto';
import { UserDataService } from 'src/provide/user-data/user-data.service';
import { TakeDeveloper } from '../decorator/take-developer.decorator';
import { WriteDeveloperActionLog } from '../action-log/write-developer-action-log.decorator';

@Roles(Role.Developer)
@Controller({ version: '1', path: 'userdata' })
export class UserDataController extends BaseController {
    constructor(private userDataService: UserDataService) {
        super();
    }

    @Post('list')
    async list(@TakeDeveloper() developer: any, @Body() dto: GetUserDataListByDeveloperDto) {
        return await this.userDataService.getList(developer.id, dto);
    }

    @WriteDeveloperActionLog('删除用户数据')
    @Post('delete')
    async delete(@TakeDeveloper() developer: any, @Body() dto: UserDataDeleteByIdsDto) {
        const result = await this.userDataService.deleteByDeveloperIdAndId(developer.id, dto.ids);
        return this.setAffected({ affectedCount: result.affected }, `删除${result.affected}条数据`);
    }
}
