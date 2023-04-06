import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeveloperService } from 'src/developer/developer.service';
import { UserService } from 'src/user/user/user.service';
import { LoginDeviceManageService } from 'src/user/login-device-manage/login-device-manage.service';
import { Application } from 'src/provide/application/application.entity';
import { SalerService } from 'src/saler/saler/saler.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private developerService: DeveloperService,
        private userService: UserService,
        private loginDeviceManageService: LoginDeviceManageService,
        private salerService: SalerService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromHeader('token'),
            ignoreExpiration: false,
            secretOrKey: configService.get('APP_JWT_SECRET'),
        });
    }

    async validate(payload: any, @Req() req: any) {
        if (payload.roles.includes('developer')) {
            if (!(await this.developerService.validateStatus(payload.id))) {
                return null;
            }
            return { id: payload.id, username: payload.username, roles: payload.roles };
        }

        if (payload.roles.includes('saler')) {
            if (!(await this.developerService.validateStatus(payload.developerId))) {
                return null;
            }
            if (!(await this.salerService.validateStatus(payload.id))) {
                return null;
            }
            return { id: payload.id, username: payload.username, roles: payload.roles, developerId: payload.developerId, parentId: payload.parentId };
        }

        if (payload.roles.includes('user')) {
            if (payload.deviceId !== req.body.deviceId) {
                // 禁止在其他设备上使用该token
                return null;
            }
            if (!(await this.userService.validateStatus(payload.id))) {
                return null;
            }
            const app = req.application as Application;
            if (!app.bindDevice && app.maxMultiDevice > 0 && !(await this.loginDeviceManageService.isDeviceExist(payload.id, payload.deviceId))) {
                // 已经失去登录状态
                return null;
            }
            if (app.bindDevice) {
                const currentDeviceId = await this.userService.getCurrentDeviceId(payload.id);
                if (currentDeviceId && currentDeviceId !== payload.deviceId) {
                    // 已经绑定其他设备
                    return null;
                }
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
            return { id: payload.id, username: payload.username, roles: payload.roles, deviceId: payload.deviceId };
        }

        return null;
    }
}
