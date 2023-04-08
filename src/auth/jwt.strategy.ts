import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeveloperService } from 'src/developer/developer.service';
import { UserService } from 'src/user/user/user.service';
import { SalerService } from 'src/saler/saler/saler.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private developerService: DeveloperService,
        private userService: UserService,
        private salerService: SalerService,
        private configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromHeader('token'),
            ignoreExpiration: false,
            secretOrKey: configService.get('APP_JWT_SECRET'),
        });
    }

    async validate(payload: any) {
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
            if (!(await this.userService.validateStatus(payload.id))) {
                return null;
            }
            return { id: payload.id, username: payload.username, roles: payload.roles, deviceId: payload.deviceId };
        }

        return null;
    }
}
