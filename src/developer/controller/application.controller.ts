import { Body, Controller, Get, InternalServerErrorException, NotAcceptableException, Post } from '@nestjs/common';
import { ApplicationService } from 'src/application/application.service';
import { CreateApplicationDto } from 'src/application/dto/application.dto';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { WriteDeveloperActionLog } from '../action-log/write-developer-action-log.decorator';
import { TakeDeveloper } from '../decorator/take-developer.decorator';

@Roles(Role.Developer)
@Controller({ version: '1', path: 'app' })
export class ApplicationController extends BaseController {
    constructor(private applicationService: ApplicationService) {
        super();
    }

    @WriteDeveloperActionLog('创建应用')
    @Post('create')
    async create(@Body() createApplicationDto: CreateApplicationDto, @TakeDeveloper() developer: any) {
        if (await this.applicationService.existByDeveloperIdAndName(developer.id, createApplicationDto.name)) {
            throw new NotAcceptableException('应用名称已存在');
        }
        const application = await this.applicationService.createApplication(createApplicationDto, developer.id);
        if (!application) {
            throw new InternalServerErrorException('创建应用失败');
        }
        this.setAffected(application, application.name);
        return application;
    }

    @Get('list')
    async list(@TakeDeveloper() developer: any) {
        return await this.applicationService.getListByDeveloperId(developer.id);
    }
}
