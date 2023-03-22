import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeveloperService } from 'src/developer/developer.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService, private developerService: DeveloperService, private userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromHeader('token'),
            ignoreExpiration: false,
            secretOrKey: configService.get('APP_JWT_SECRET'),
        });
    }

    async validate(payload: any, @Req() req: any) {
        if (payload.roles.includes('developer')) {
            if (payload.deviceId !== req.body.deviceId) {
                // 禁止在其他设备上使用该token
                return null;
            }
            if (!(await this.developerService.validateStatus(payload.id))) {
                return null;
            }
            return { id: payload.id, username: payload.username, roles: payload.roles, deviceId: payload.deviceId };
        }

        if (payload.roles.includes('user')) {
            if (!(await this.userService.validateStatus(payload.id))) {
                return null;
            }
            return { id: payload.id, username: payload.username, roles: payload.roles };
        }

        return null;
    }
}
