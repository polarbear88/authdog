import { CanActivate, ExecutionContext, Injectable, NotAcceptableException } from '@nestjs/common';
import { Application } from 'src/provide/application/application.entity';
import { User } from '../user/user.entity';
import { Device } from '../device/device.entity';
import { DeveloperService } from 'src/developer/developer.service';
import { UserService } from '../user/user.service';
import { DeviceService } from '../device/device.service';

// 此守卫用于在用户模式和设备模式都可用的接口进行付费检查
@Injectable()
export class ApiUserOrDevicePaidGuard implements CanActivate {
    constructor(private developerService: DeveloperService, private userService: UserService, private deviceService: DeviceService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const app = request.application as Application;
        if ((await this.developerService.getStatus(app.developerId)) !== 'normal') {
            throw new NotAcceptableException('开发者已被禁用');
        }
        let user: User | Device;
        if (app.authMode === 'user') {
            const token = request.headers['token'] as string;
            user = await this.userService.validateUserAuthForToken(app, token, request.body.deviceId);
        } else {
            const device = await this.deviceService.findByAppidAndDeviceId(app.id, request.body.deviceId);
            if (!device || device.status !== 'normal') {
                throw new NotAcceptableException('设备已被禁用');
            }
            if (!this.deviceService.validateUserAuth(app, device).result) {
                throw new NotAcceptableException('用户未授权');
            }
            user = device;
        }
        request.user = user;
        return true;
    }
}
