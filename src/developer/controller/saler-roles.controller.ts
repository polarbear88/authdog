import { Body, Controller, Get, NotAcceptableException, Post, Query } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { SalerRolesSetPriceConfigDto } from 'src/saler-roles/saler-roles.dto';
import { SalerRolesService } from 'src/saler-roles/saler-roles.service';
import { SalerService } from 'src/saler/saler.service';
import { WriteDeveloperActionLog } from '../action-log/write-developer-action-log.decorator';
import { TakeDeveloper } from '../decorator/take-developer.decorator';

@Roles(Role.Developer)
@Controller({ version: '1', path: 'saler-roles' })
export class SalerRolesController extends BaseController {
    constructor(private salerRolesService: SalerRolesService, private salerService: SalerService) {
        super();
    }

    @Get('list')
    async list(@TakeDeveloper() developer: any) {
        return await this.salerRolesService.getList(developer.id);
    }

    @WriteDeveloperActionLog('创建代理角色')
    @Get('create')
    async create(@TakeDeveloper() developer: any, @Query('name') name: string) {
        if (!name) {
            throw new NotAcceptableException('角色名称不能为空');
        }
        const role = await this.salerRolesService.create(developer.id, name);
        return this.setAffected(role, role.name);
    }

    @WriteDeveloperActionLog('配置代理角色')
    @Post('set-price-config')
    async setPriceConfig(@TakeDeveloper() developer: any, @Body() dto: SalerRolesSetPriceConfigDto) {
        const salerRole = await this.salerRolesService.findByDeveloperAndId(developer.id, dto.id);
        if (!salerRole) {
            throw new NotAcceptableException('角色不存在');
        }
        await this.salerRolesService.setPriceConfig(salerRole.id, dto.priceConfig);
        return this.setAffected({}, salerRole.name);
    }

    @WriteDeveloperActionLog('删除代理角色')
    @Get('delete')
    async delete(@TakeDeveloper() developer: any, @Query('id') id: number) {
        id = Number(id);
        if (!id) {
            throw new NotAcceptableException('角色ID不能为空');
        }
        const salerRole = await this.salerRolesService.findByDeveloperAndId(developer.id, id);
        if (!salerRole) {
            throw new NotAcceptableException('角色不存在');
        }
        await this.salerService.resetSalerRole(developer.id, salerRole.id);
        await this.salerRolesService.delete(salerRole.id);
        return this.setAffected({}, salerRole.name);
    }
}
