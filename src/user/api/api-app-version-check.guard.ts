// 用于检查应用状态和开发者状态的守卫
import { Injectable, CanActivate, ExecutionContext, NotAcceptableException } from '@nestjs/common';
import { Application } from 'src/provide/application/application.entity';

/**
 * 用于检查应用版本的守卫
 */
@Injectable()
export class ApiAppVersionCheckGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const app = request.application as Application;
        if (app.forceUpgrade && request.clientVersion !== app.version) {
            throw new NotAcceptableException('请升级客户端');
        }
        return true;
    }
}
