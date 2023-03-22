import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Application } from 'src/application/application.entity';
import { ExpressUtils } from 'src/common/utils/express.utils';
import { UserDeviceService } from 'src/user-device/user-device.service';

// 用于拦截用户设备信息 保存以统计用户设备信息
@Injectable()
export class ApiUserDeviceInterceptor implements NestInterceptor {
    constructor(private userDeviceService: UserDeviceService) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const deviceId = request.body.deviceId;
        if (!deviceId) {
            throw new BadRequestException('请传入deviceId');
        }
        const app = request.application as Application;
        if (!(await this.userDeviceService.existByDeviceId(app.id, deviceId))) {
            await this.userDeviceService.create(app, ExpressUtils.getIp(request), request.body);
        }
        return next.handle();
    }
}
