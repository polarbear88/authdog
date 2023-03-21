import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeveloperService } from 'src/developer/developer.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService, private developerService: DeveloperService) {
        super({
            jwtFromRequest: ExtractJwt.fromHeader('token'),
            ignoreExpiration: false,
            secretOrKey: configService.get('APP_JWT_SECRET'),
        });
    }

    async validate(payload: any) {
        if (payload.roles.includes('developer')) {
            const status = await this.developerService.getStatus(payload.id);
            // 验证账号状态
            if (status !== 'normal') {
                return null;
            }
        }
        return { id: payload.id, username: payload.username, roles: payload.roles };
    }
}
