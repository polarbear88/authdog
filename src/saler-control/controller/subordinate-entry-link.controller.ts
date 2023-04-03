import { Controller, Get, NotAcceptableException, Query } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { SalerEntryLinkService } from 'src/saler/entry-link/entry-link.service';
import { TakeSaler } from '../take-saler.decorator';
import { ParseSalerPipe } from '../parse-saler.pipe';
import { Saler } from 'src/saler/saler.entity';

@Roles(Role.Saler)
@Controller({ version: '1', path: 'subordinate-entry-link' })
export class SubordinateEntryController extends BaseController {
    constructor(private salerEntryLinkService: SalerEntryLinkService) {
        super();
    }

    @Get('list')
    async list(@TakeSaler(ParseSalerPipe) saler: Saler) {
        return await this.salerEntryLinkService.getList(saler.developerId, saler.id);
    }

    @Get('create')
    async create(@TakeSaler(ParseSalerPipe) saler: Saler, @Query('type') type: string, @Query('name') name: string) {
        if (type !== 'login' && type !== 'register') {
            throw new NotAcceptableException('type参数错误');
        }
        if (!name) {
            throw new NotAcceptableException('name参数错误');
        }
        return await this.salerEntryLinkService.create(saler.developerId, saler.id, type, name, saler.name);
    }

    @Get('delete')
    async delete(@TakeSaler(ParseSalerPipe) saler: Saler, @Query('token') token: string) {
        if (!token) {
            throw new NotAcceptableException('token参数错误');
        }
        await this.salerEntryLinkService.delete(saler.developerId, saler.id, token);
        return null;
    }
}
