import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Application } from 'src/application/application.entity';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { GetUserListDto } from 'src/user/user.dto';
import { UserService } from 'src/user/user.service';
import { TakeApplication } from '../decorator/take-application.decorator';
import { AppActionGuard } from '../guard/app-action.guard';

@UseGuards(AppActionGuard)
@Roles(Role.Developer)
@Controller({ version: '1', path: 'user' })
export class UserController extends BaseController {
    constructor(private userService: UserService) {
        super();
    }

    @Post('list')
    async list(@TakeApplication() app: Application, @Body() getUserListDto: GetUserListDto) {
        return this.userService.getList(app.id, getUserListDto);
    }
}
