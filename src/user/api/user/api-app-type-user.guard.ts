import { Injectable, CanActivate, ExecutionContext, NotAcceptableException } from '@nestjs/common';
import { Application } from 'src/provide/application/application.entity';

/**
 * 用于检查应用的授权类型是否允许访问
 */
@Injectable()
export class ApiAppTypeUserGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const app = request.application as Application;
        if (app.authMode !== 'user') {
            throw new NotAcceptableException('当前应用不支持此操作');
        }
        return true;
    }
}
