import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Application } from 'src/provide/application/application.entity';
import { LoginDeviceManageService } from 'src/user/login-device-manage/login-device-manage.service';
import { User } from 'src/user/user/user.entity';
import { UserService } from 'src/user/user/user.service';

// 此守卫用于验证用户请求设备是否是登录的设备，包括是否绑定其他设备等
@Injectable()
export class ApiUserDeviceValidateGuard implements CanActivate {
    constructor(private loginDeviceManageService: LoginDeviceManageService, private userService: UserService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const payload = req.user;
        if (payload.deviceId !== req.body.deviceId) {
            // 禁止在其他设备上使用该token
            throw new UnauthorizedException('已失去登录状态');
        }
        const app = req.application as Application;
        if (!app.bindDevice && app.maxMultiDevice > 0 && !(await this.loginDeviceManageService.isDeviceExist(payload.id, payload.deviceId))) {
            // 已经失去登录状态
            throw new UnauthorizedException('已失去登录状态');
        }
        if (app.bindDevice) {
            const currentDeviceId = await this.userService.getCurrentDeviceId(payload.id);
            if (currentDeviceId && currentDeviceId !== payload.deviceId) {
                // 已经绑定其他设备
                throw new UnauthorizedException('已失去登录状态');
            }
        }
        const user = (await this.userService.findById(payload.id)) as User;
        if (!user) {
            throw new UnauthorizedException('已失去登录状态');
        }
        if (!this.userService.validateUserAuthForDate(user, app).result) {
            throw new UnauthorizedException('已失去登录状态');
        }
        // 判断是否记录绑定的设备
        // if (app.bindDevice && !(await this.userService.getCurrentDeviceId(payload.id))) {
        //     // 记录绑定的设备
        //     await this.userService.setCurrentDeviceId(payload.id, payload.deviceId);
        // }
        // 更新活动时间
        if (!app.bindDevice && app.maxMultiDevice > 0) {
            this.loginDeviceManageService.updateDevice(payload.id, payload.deviceId);
        }
        req.user = user;
        return true;
    }
}
