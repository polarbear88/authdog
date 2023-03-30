import { Body, Controller, InternalServerErrorException, NotAcceptableException, Post, Req, UseInterceptors } from '@nestjs/common';
import { Application } from 'src/application/application.entity';
import { CloudfunRuner } from 'src/cloudfun/cloudfun-runer';
import { RunCloudfunDto } from 'src/Cloudfun/cloudfun.dto';
import { CloudfunService } from 'src/cloudfun/cloudfun.service';
import { BaseController } from 'src/common/controller/base.controller';
import { Public } from 'src/common/decorator/public.decorator';
import { DeveloperService } from 'src/developer/developer.service';
import { Device } from 'src/device/device.entity';
import { DeviceService } from 'src/device/device.service';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { ApiEncryptInterceptor } from '../api-encrypt.interceptor';
import { ApiUserDeviceInterceptor } from '../api-user-device.interceptor';
import { ApiTakeApp } from '../decorator/api-take-app.decorator';

@Public()
@UseInterceptors(ApiUserDeviceInterceptor, ApiEncryptInterceptor)
@Controller({ version: '1' })
export class ApiCloudfunController extends BaseController {
    constructor(
        private cloudfunService: CloudfunService,
        private developerService: DeveloperService,
        private userService: UserService,
        private deviceService: DeviceService,
    ) {
        super();
    }

    @Post('run')
    async run(@ApiTakeApp() app: Application, @Body() dto: RunCloudfunDto, @Req() request: any) {
        if ((await this.developerService.getStatus(app.developerId)) !== 'normal') {
            throw new NotAcceptableException('开发者已被禁用');
        }
        const cloudfun = await this.cloudfunService.findByDeveloperIdAndId(app.developerId, dto.id);
        if (!cloudfun) {
            throw new NotAcceptableException('函数不存在');
        }
        if (!cloudfun.isGlobal && cloudfun.applicationId !== app.id) {
            throw new NotAcceptableException('函数不存在');
        }
        let user: User | Device;
        if (app.authMode === 'user') {
            const token = request.headers['token'] as string;
            user = await this.userService.validateUserAuthForToken(app, token, dto.deviceId);
        } else {
            const device = await this.deviceService.findByAppidAndDeviceId(app.id, dto.deviceId);
            if (!device || device.status !== 'normal') {
                throw new NotAcceptableException('设备已被禁用');
            }
            if (!this.deviceService.validateUserAuth(app, device).result) {
                throw new NotAcceptableException('用户未授权');
            }
            user = device;
        }
        const args = dto.args || [];
        try {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const result = await new CloudfunRuner(user._serialization(), cloudfun.script, (balance: number, reason: string) => {
                if (typeof balance === 'number' && typeof reason === 'string' && balance > 0) {
                    const service = app.authMode === 'user' ? this.userService : this.deviceService;
                    service
                        .subBanlance(user as any, balance, reason)
                        .then(() => {
                            //
                        })
                        .catch(() => {
                            //
                        });
                }
            }).run(args);
            return {
                result,
            };
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }
}
