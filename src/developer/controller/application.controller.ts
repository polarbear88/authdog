import { Body, Controller, Get, InternalServerErrorException, NotAcceptableException, Post, UseGuards } from '@nestjs/common';
import { Application } from 'src/application/application.entity';
import { ApplicationService } from 'src/application/application.service';
import {
    CreateApplicationDto,
    SetApplicationDownloadUrlDto,
    ResetApplicationCryptoModeDto,
    SetApplicationIsFreeDto,
    SetApplicationtTrialTimeDto,
    SetApplicationIsBindDeviceDto,
    SetApplicationIsAllowUnbindDto,
    SetApplicationUnbindDeductTimeDto,
    SetApplicationUnbindDeductCountDto,
    SetApplicationMaxUnbindCountDto,
} from 'src/application/dto/application.dto';
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

    @UseGuards(AppActionGuard)
    @WriteDeveloperActionLog('开启强制升级')
    @Get('enable-forceUpgrade')
    async enableForceUpgrade(@TakeApplication() app: Application) {
        await this.applicationService.setForceUpgrade(app.id, true);
        return this.setAffected({}, app.name);
    }

    @UseGuards(AppActionGuard)
    @WriteDeveloperActionLog('关闭强制升级')
    @Get('disable-forceUpgrade')
    async disableForceUpgrade(@TakeApplication() app: Application) {
        await this.applicationService.setForceUpgrade(app.id, false);
        return this.setAffected({}, app.name);
    }

    @UseGuards(AppActionGuard)
    @WriteDeveloperActionLog('设置下载地址')
    @Post('set-downloadUrl')
    async setDownloadUrl(@Body() setApplicationDownloadUrlDto: SetApplicationDownloadUrlDto, @TakeApplication() app: Application) {
        await this.applicationService.setDownloadUrl(app.id, setApplicationDownloadUrlDto.downloadUrl);
        return this.setAffected({}, app.name);
    }

    @UseGuards(AppActionGuard)
    @WriteDeveloperActionLog('重置加密模式')
    @Post('reset-cryptoMode')
    async resetCryptoMode(@Body() resetApplicationCryptoModeDto: ResetApplicationCryptoModeDto, @TakeApplication() app: Application) {
        await this.applicationService.resetCryptoMode(app.id, resetApplicationCryptoModeDto.cryptoMode);
        return this.setAffected({}, app.name);
    }

    @UseGuards(AppActionGuard)
    @WriteDeveloperActionLog('设置是否免费')
    @Post('set-free')
    async setFree(@Body() setApplicationIsFreeDto: SetApplicationIsFreeDto, @TakeApplication() app: Application) {
        await this.applicationService.setIsFree(app.id, setApplicationIsFreeDto.free);
        return this.setAffected({}, app.name);
    }

    @UseGuards(AppActionGuard)
    @WriteDeveloperActionLog('设置试用时间')
    @Post('set-trialTime')
    async setTrialTime(@Body() setApplicationtTrialTimeDto: SetApplicationtTrialTimeDto, @TakeApplication() app: Application) {
        await this.applicationService.setTrialTime(app.id, setApplicationtTrialTimeDto.trialTime);
        return this.setAffected({}, app.name);
    }

    @UseGuards(AppActionGuard)
    @WriteDeveloperActionLog('设置是否绑定设备')
    @Post('set-bindDevice')
    async setBindDevice(@Body() setApplicationIsBindDeviceDto: SetApplicationIsBindDeviceDto, @TakeApplication() app: Application) {
        await this.applicationService.setBindDevice(app.id, setApplicationIsBindDeviceDto.bindDevice);
        return this.setAffected({}, app.name);
    }

    @UseGuards(AppActionGuard)
    @WriteDeveloperActionLog('设置是否允许解绑')
    @Post('set-allowUnbind')
    async setAllowUnbind(@Body() setApplicationIsAllowUnbindDto: SetApplicationIsAllowUnbindDto, @TakeApplication() app: Application) {
        await this.applicationService.setAllowUnbind(app.id, setApplicationIsAllowUnbindDto.allowUnbind);
        return this.setAffected({}, app.name);
    }

    @UseGuards(AppActionGuard)
    @WriteDeveloperActionLog('设置解绑扣时')
    @Post('set-unbindDeductTime')
    async setUnbindDeductTime(@Body() setApplicationUnbindDeductTimeDto: SetApplicationUnbindDeductTimeDto, @TakeApplication() app: Application) {
        await this.applicationService.setUnbindDeductTime(app.id, setApplicationUnbindDeductTimeDto.unbindDeductTime);
        return this.setAffected({}, app.name);
    }

    @UseGuards(AppActionGuard)
    @WriteDeveloperActionLog('设置解绑扣次')
    @Post('set-unbindDeductCount')
    async setUnbindDeductCount(@Body() setApplicationUnbindDeductCountDto: SetApplicationUnbindDeductCountDto, @TakeApplication() app: Application) {
        await this.applicationService.setUnbindDeductCount(app.id, setApplicationUnbindDeductCountDto.unbindDeductCount);
        return this.setAffected({}, app.name);
    }

    @UseGuards(AppActionGuard)
    @WriteDeveloperActionLog('设置最大解绑次数')
    @Post('set-maxUnbindCount')
    async setMaxUnbindCount(@Body() setApplicationMaxUnbindCountDto: SetApplicationMaxUnbindCountDto, @TakeApplication() app: Application) {
        await this.applicationService.setMaxUnbindCount(app.id, setApplicationMaxUnbindCountDto.maxUnbindCount);
        return this.setAffected({}, app.name);
    }
}