import { Controller, NotAcceptableException, Post, SetMetadata, UseInterceptors } from '@nestjs/common';
import { Application } from 'src/provide/application/application.entity';
import { BaseController } from 'src/common/controller/base.controller';
import { Public } from 'src/common/decorator/public.decorator';
import { DeveloperService } from 'src/developer/developer.service';
import { ApiUserDeviceInterceptor } from '../api-user-device.interceptor';
import { ApiTakeApp } from '../decorator/api-take-app.decorator';

@Public()
@UseInterceptors(ApiUserDeviceInterceptor)
@Controller({ version: '1' })
export class ApiAppController extends BaseController {
    constructor(private developerService: DeveloperService) {
        super();
    }

    @Post('info')
    async info(@ApiTakeApp() app: Application) {
        if (app.status !== 'published') {
            throw new NotAcceptableException('应用已被禁用');
        }
        if ((await this.developerService.getStatus(app.developerId)) !== 'normal') {
            throw new NotAcceptableException('开发者已被禁用');
        }
        return {
            name: app.name,
            version: app.version,
            forceUpgrade: app.forceUpgrade,
            downloadUrl: app.downloadUrl,
            notice: app.notice,
        };
    }
}
