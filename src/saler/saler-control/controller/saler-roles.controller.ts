import { Body, Controller, Get, NotAcceptableException, Post, Query } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { SalerRolesService } from 'src/saler/saler-roles/saler-roles.service';
import { SalerService } from 'src/saler/saler/saler.service';
import { TakeSaler } from '../take-saler.decorator';
import { ParseSalerPipe } from '../parse-saler.pipe';
import { Saler } from 'src/saler/saler/saler.entity';
import { SalerRolesSetPriceConfigDto } from 'src/saler/saler-roles/saler-roles.dto';

@Roles(Role.Saler)
@Controller({ version: '1', path: 'saler-roles' })
export class SalerRolesController extends BaseController {
    constructor(private salerRolesService: SalerRolesService, private salerService: SalerService) {
        super();
    }

    @Get('list')
    async list(@TakeSaler(ParseSalerPipe) saler: Saler) {
        return await this.salerRolesService.getList(saler.developerId, saler.id);
    }

    @Get('create')
    async create(@TakeSaler(ParseSalerPipe) saler: Saler, @Query('name') name: string) {
        if (!name) {
            throw new NotAcceptableException('角色名称不能为空');
        }
        await this.salerRolesService.create(saler.developerId, name, saler.id);
        return null;
    }

    @Post('set-price-config')
    async setPriceConfig(@TakeSaler(ParseSalerPipe) saler: Saler, @Body() dto: SalerRolesSetPriceConfigDto) {
        const salerRole = await this.salerRolesService.findByDeveloperAndId(saler.developerId, dto.id, saler.id);
        if (!salerRole) {
            throw new NotAcceptableException('角色不存在');
        }
        await this.salerRolesService.setPriceConfig(salerRole.id, dto.priceConfig);
        return null;
    }

    @Get('delete')
    async delete(@TakeSaler(ParseSalerPipe) saler: Saler, @Query('id') id: number) {
        id = Number(id);
        if (!id) {
            throw new NotAcceptableException('角色ID不能为空');
        }
        const salerRole = await this.salerRolesService.findByDeveloperAndId(saler.developerId, id, saler.id);
        if (!salerRole) {
            throw new NotAcceptableException('角色不存在');
        }
        await this.salerService.resetSalerRoleForSaler(saler.developerId, saler.id, salerRole.id);
        await this.salerRolesService.delete(salerRole.id);
        return null;
    }
}
