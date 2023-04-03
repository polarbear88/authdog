import { Body, Controller, Get, NotAcceptableException, Post, Query } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { SalerRolesService } from 'src/saler-roles/saler-roles.service';
import { AddSalerBanlanceDto, CreateSalerByDevloperDto, GetSalerListDto, SalerSetRoleDto, SetSalerAppsDto } from 'src/saler/saler.dto';
import { Saler } from 'src/saler/saler.entity';
import { SalerService } from 'src/saler/saler.service';
import { SalerStatus } from 'src/saler/saler.type';
import { ChangeUserPwdByDevDto, SetUserStatusDto } from 'src/user/user.dto';
import { UpdateQueryBuilder } from 'typeorm';
import { WriteDeveloperActionLog } from '../action-log/write-developer-action-log.decorator';
import { TakeDeveloper } from '../decorator/take-developer.decorator';
import { Developer } from '../developer.entity';
import { DeveloperService } from '../developer.service';
import { ParseDeveloperPipe } from '../pipe/parse-developer.pipe';

@Roles(Role.Developer)
@Controller({ version: '1', path: 'saler' })
export class SalerController extends BaseController {
    constructor(private salerService: SalerService, private developerService: DeveloperService, private salerRolesService: SalerRolesService) {
        super();
    }

    @Post('list')
    async list(@TakeDeveloper() developer: any, @Body() dto: GetSalerListDto) {
        return this.salerService.getList(developer.id, dto);
    }

    @WriteDeveloperActionLog('创建代理')
    @Post('create')
    async create(@TakeDeveloper() developer: any, @Body() dto: CreateSalerByDevloperDto) {
        if (await this.salerService.existByName(developer.id, dto.name)) {
            throw new NotAcceptableException('该代理名称已存在');
        }
        if (await this.salerService.existByMobile(developer.id, dto.mobile)) {
            throw new NotAcceptableException('该代理名称已存在');
        }
        const saler = await this.salerService.createByDevloper(developer.id, dto);
        return this.setAffected(saler._serializationThis(), saler.name);
    }

    @WriteDeveloperActionLog('修改代理密码')
    @Post('change-password')
    async changePassword(@TakeDeveloper() developer: any, @Body() dto: ChangeUserPwdByDevDto) {
        const saler = await this.salerService.changePassword(developer.id, dto);
        return this.setAffected({}, saler.name);
    }

    @WriteDeveloperActionLog('设置代理状态')
    @Post('set-status')
    async setStatus(@TakeDeveloper() developer: any, @Body() dto: SetUserStatusDto) {
        const affected = await this.salerService.setStatusByIds(dto.ids, dto.status as SalerStatus, (query: UpdateQueryBuilder<Saler>) => {
            query.andWhere('developerId = :developerId', { developerId: developer.id });
        });
        return this.setAffected({ affectedCount: affected }, `操作${affected}个代理[${dto.status}]`);
    }

    @WriteDeveloperActionLog('增减代理余额')
    @Post('add-banlance')
    async addBanlance(@TakeDeveloper(ParseDeveloperPipe) developer: Developer, @Body() dto: AddSalerBanlanceDto) {
        if (dto.amount === 0 || isNaN(dto.amount)) {
            throw new NotAcceptableException('操作失败');
        }
        const saler = await this.salerService.findByIdAndDeveloperId(developer.id, dto.id);
        if (!saler) {
            throw new NotAcceptableException('操作失败');
        }
        if (dto.amount > 0) {
            await this.salerService.addBanlance(developer, saler, dto.amount, '后台充值', null);
            await this.developerService.incIncome(developer.id, dto.amount);
        } else {
            await this.salerService.subBanlance(developer, saler, -dto.amount, '后台扣减', null, true);
            await this.developerService.decIncome(developer.id, -dto.amount);
        }
        return this.setAffected({}, `${saler.name}余额${dto.amount > 0 ? '增加' : '减少'}${Math.abs(dto.amount)}`);
    }

    @Post('set-apps')
    async setApps(@TakeDeveloper() developer: any, @Body() dto: SetSalerAppsDto) {
        await this.salerService.setApps(developer.id, dto);
        return null;
    }

    @WriteDeveloperActionLog('设置代理角色')
    @Post('set-roles')
    async setRoles(@TakeDeveloper() developer: any, @Body() dto: SalerSetRoleDto) {
        const role = await this.salerRolesService.findByDeveloperAndId(developer.id, dto.roleId);
        if (!role) {
            throw new NotAcceptableException('角色不存在');
        }
        const affected = await this.salerService.setRoleIdByIds(dto.ids, role, (query: UpdateQueryBuilder<Saler>) => {
            query.andWhere('developerId = :developerId', { developerId: developer.id });
            query.andWhere('parentId = 0');
        });
        return this.setAffected({ affectedCount: affected }, `操作${affected}个代理[${role.name}]`);
    }

    @WriteDeveloperActionLog('删除代理')
    @Get('delete')
    async delete(@TakeDeveloper() developer: any, @Query('id') id: string) {
        const salerId = parseInt(id.trim());
        if (!salerId) throw new NotAcceptableException('参数错误');
        const affected = await this.salerService.deleteSaler(developer.id, salerId);
        return this.setAffected({ affectedCount: affected }, `影响${affected}个代理`);
    }
}
