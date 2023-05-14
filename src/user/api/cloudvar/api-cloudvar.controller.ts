import { Body, Controller, NotAcceptableException, Post, Req, SetMetadata, UseInterceptors } from '@nestjs/common';
import { Application } from 'src/provide/application/application.entity';
import { GetCloudvarByNameDto, GetCloudvarDto } from 'src/provide/cloudvar/cloudvar.dto';
import { CloudvarService } from 'src/provide/cloudvar/cloudvar.service';
import { BaseController } from 'src/common/controller/base.controller';
import { Public } from 'src/common/decorator/public.decorator';
import { DeveloperService } from 'src/developer/developer.service';
import { DeviceService } from 'src/user/device/device.service';
import { UserService } from 'src/user/user/user.service';
import { ApiUserDeviceInterceptor } from '../api-user-device.interceptor';
import { ApiTakeApp } from '../decorator/api-take-app.decorator';

@Public()
@UseInterceptors(ApiUserDeviceInterceptor)
@Controller({ version: '1' })
export class ApiCloudvarController extends BaseController {
    constructor(
        private cloudvarService: CloudvarService,
        private developerService: DeveloperService,
        private userService: UserService,
        private deviceService: DeviceService,
    ) {
        super();
    }

    @Post('get')
    async get(@ApiTakeApp() app: Application, @Body() dto: GetCloudvarDto, @Req() request: any) {
        if ((await this.developerService.getStatus(app.developerId)) !== 'normal') {
            throw new NotAcceptableException('开发者已被禁用');
        }
        const cloudvar = await this.cloudvarService.findByDeveloperIdAndId(app.developerId, dto.id);
        return await this.getCloudvar(cloudvar, app, dto, request);
    }

    @Post('getByName')
    async getByName(@ApiTakeApp() app: Application, @Body() dto: GetCloudvarByNameDto, @Req() request: any) {
        if ((await this.developerService.getStatus(app.developerId)) !== 'normal') {
            throw new NotAcceptableException('开发者已被禁用');
        }
        const cloudvar = await this.cloudvarService.findByName(app.developerId, dto.varname);
        return await this.getCloudvar(cloudvar, app, dto, request);
    }

    async getCloudvar(cloudvar: any, app: Application, dto: GetCloudvarDto | GetCloudvarByNameDto, request: any) {
        if (!cloudvar) {
            throw new NotAcceptableException('变量不存在');
        }
        if (!cloudvar.isGlobal && cloudvar.applicationId !== app.id) {
            throw new NotAcceptableException('变量不存在');
        }
        if (!cloudvar.isPublic) {
            if (app.authMode === 'user') {
                // 用户模式下检查授权
                const token = request.headers['token'] as string;
                await this.userService.validateUserAuthForToken(app, token, dto.deviceId);
            } else {
                // 设备模式下检查授权
                const device = await this.deviceService.findByAppidAndDeviceId(app.id, dto.deviceId);
                if (!device || device.status !== 'normal') {
                    throw new NotAcceptableException('设备已被禁用');
                }
                if (!this.deviceService.validateUserAuth(app, device).result) {
                    throw new NotAcceptableException('用户未授权');
                }
            }
        }
        return {
            value: cloudvar.value,
        };
    }
}
