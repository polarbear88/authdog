import { Body, Controller, Get, InternalServerErrorException, NotAcceptableException, Post, UseGuards } from '@nestjs/common';
import { Application } from 'src/application/application.entity';
import { ApplicationService } from 'src/application/application.service';
import { CreateApplicationDto } from 'src/application/dto/application.dto';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { WriteDeveloperActionLog } from '../action-log/write-developer-action-log.decorator';
import { TakeApplication } from '../decorator/take-application.decorator';
import { TakeDeveloper } from '../decorator/take-developer.decorator';
import { AppActionGuard } from '../guard/app-action.guard';

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

    @UseGuards(AppActionGuard)
    @Get('detail')
    async detail(@TakeApplication() app: Application) {
        return app;
    }

    @UseGuards(AppActionGuard)
    @WriteDeveloperActionLog('设置应用公告')
    @Post('set-notice')
    async setNotice(@Body() setApplicationNoticeDto: any, @TakeApplication() app: Application) {
        await this.applicationService.setNotice(app.id, setApplicationNoticeDto.notice);
        return this.setAffected({}, app.name);
    }

    @UseGuards(AppActionGuard)
    @WriteDeveloperActionLog('启用应用')
    @Get('enable')
    async enable(@TakeApplication() app: Application) {
        await this.applicationService.setStatus(app.id, 'published');
        return this.setAffected({}, app.name);
    }

    @UseGuards(AppActionGuard)
    @WriteDeveloperActionLog('禁用应用')
    @Get('disable')
    async disable(@TakeApplication() app: Application) {
        await this.applicationService.setStatus(app.id, 'disabled');
        return this.setAffected({}, app.name);
    }
}
