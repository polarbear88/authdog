import { Body, Controller, NotAcceptableException, Post } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CreateSalerByDevloperDto, GetSalerListDto } from 'src/saler/saler.dto';
import { SalerService } from 'src/saler/saler.service';
import { WriteDeveloperActionLog } from '../action-log/write-developer-action-log.decorator';
import { TakeDeveloper } from '../decorator/take-developer.decorator';

@Roles(Role.Developer)
@Controller({ version: '1', path: 'saler' })
export class SalerController extends BaseController {
    constructor(private salerService: SalerService) {
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
            return new NotAcceptableException('该代理名称已存在');
        }
        if (await this.salerService.existByMobile(developer.id, dto.mobile)) {
            return new NotAcceptableException('该代理名称已存在');
        }
        const saler = await this.salerService.createByDevloper(developer.id, dto);
        return this.setAffected(saler._serializationThis(), saler.name);
    }
}
