import { Body, Controller, Post } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { OnlineUserManagerService } from 'src/provide/online-user-manager/online-user-manager.service';
import { TakeDeveloper } from '../decorator/take-developer.decorator';
import { GetOnlineUserListDto, KickOnlineUserDto } from 'src/provide/online-user-manager/online-user.dto';

@Roles(Role.Developer)
@Controller({ version: '1', path: 'online-user-manager' })
export class OnlineUserManagerController extends BaseController {
    constructor(private onlineUserManagerService: OnlineUserManagerService) {
        super();
    }

    @Post('list')
    async list(@TakeDeveloper() developer: any, @Body() dto: GetOnlineUserListDto) {
        return this.onlineUserManagerService.getList(developer.id, dto);
    }

    @Post('kick')
    async kick(@TakeDeveloper() developer: any, @Body() dto: KickOnlineUserDto) {
        this.onlineUserManagerService.kick(developer.id, dto.ids);
        return null;
    }
}
