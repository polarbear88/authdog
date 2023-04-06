import { Controller, Get, NotAcceptableException, Post, Query } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { SalerEntryLinkService } from 'src/saler/saler/entry-link/entry-link.service';
import { TakeDeveloper } from '../decorator/take-developer.decorator';

@Roles(Role.Developer)
@Controller({ version: '1', path: 'saler-entry-link' })
export class SalerEntryLinkController extends BaseController {
    constructor(private salerEntryLinkService: SalerEntryLinkService) {
        super();
    }

    @Get('list')
    async list(@TakeDeveloper() developer: any) {
        return await this.salerEntryLinkService.getList(developer.id);
    }

    @Get('create')
    async create(@TakeDeveloper() developer: any, @Query('type') type: string, @Query('name') name: string) {
        if (type !== 'login' && type !== 'register') {
            throw new NotAcceptableException('type参数错误');
        }
        if (!name) {
            throw new NotAcceptableException('name参数错误');
        }
        return await this.salerEntryLinkService.create(developer.id, 0, type, name);
    }

    @Get('delete')
    async delete(@TakeDeveloper() developer: any, @Query('token') token: string) {
        if (!token) {
            throw new NotAcceptableException('token参数错误');
        }
        await this.salerEntryLinkService.delete(developer.id, 0, token);
        return null;
    }
}
