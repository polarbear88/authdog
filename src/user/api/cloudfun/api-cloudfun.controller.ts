import { Body, Controller, InternalServerErrorException, NotAcceptableException, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { Application } from 'src/provide/application/application.entity';
import { CloudfunRuner } from 'src/provide/cloudfun/cloudfun-runer';
import { RunCloudfunDto } from 'src/provide/cloudfun/cloudfun.dto';
import { CloudfunService } from 'src/provide/cloudfun/cloudfun.service';
import { BaseController } from 'src/common/controller/base.controller';
import { Public } from 'src/common/decorator/public.decorator';
import { DeviceService } from 'src/user/device/device.service';
import { UserService } from 'src/user/user/user.service';
import { ApiUserDeviceInterceptor } from '../api-user-device.interceptor';
import { ApiTakeApp } from '../decorator/api-take-app.decorator';
import { ApiUserOrDevicePaidGuard } from '../api-user-or-device-paid.guard';
import { DeveloperService } from 'src/developer/developer.service';
import { Developer } from 'src/developer/developer.entity';
import { QuotaService } from 'src/quota/quota.service';

@Public()
@UseGuards(ApiUserOrDevicePaidGuard)
@UseInterceptors(ApiUserDeviceInterceptor)
@Controller({ version: '1' })
export class ApiCloudfunController extends BaseController {
    constructor(
        private cloudfunService: CloudfunService,
        private userService: UserService,
        private deviceService: DeviceService,
        private developerService: DeveloperService,
        private quotaService: QuotaService,
    ) {
        super();
    }

    @Post('run')
    async run(@ApiTakeApp() app: Application, @Body() dto: RunCloudfunDto, @Req() request: any) {
        const cloudfun = await this.cloudfunService.findByDeveloperIdAndId(app.developerId, dto.id);
        if (!cloudfun) {
            throw new NotAcceptableException('函数不存在');
        }
        if (!cloudfun.isGlobal && cloudfun.applicationId !== app.id) {
            throw new NotAcceptableException('函数不存在');
        }
        if (!this.cloudfunService.checkAllowType(cloudfun.type)) {
            throw new NotAcceptableException('不允许使用该类型的云函数');
        }
        // 检查配额
        const funs = await this.cloudfunService.findByDeveloperId(app.developerId);
        const developer = (await this.developerService.findById(app.developerId)) as Developer;
        const quota = await this.quotaService.getByName(developer.quota);
        const index = funs.findIndex((item) => item.id === cloudfun.id);
        if (index >= quota.maxCloudfunCount) {
            throw new NotAcceptableException('函数数量超过配额');
        }
        const user = request.user;
        const args = dto.args || [];
        try {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const result = await CloudfunRuner.run(cloudfun, args, user._serialization(), (balance: number, reason: string) => {
                if (typeof balance === 'number' && typeof reason === 'string' && balance > 0) {
                    const service = app.authMode === 'user' ? this.userService : this.deviceService;
                    // 由于此函数在虚拟机中运行，并且不支持await，所以这里立即返回然后在后台执行
                    service
                        .subBanlance(user as any, balance, reason)
                        .then(() => {
                            //
                        })
                        .catch(() => {
                            //
                        });
                }
            });

            return {
                result,
            };
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }
}
