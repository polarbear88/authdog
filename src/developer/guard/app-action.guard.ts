import { Injectable, CanActivate, ExecutionContext, NotAcceptableException } from '@nestjs/common';
import { ApplicationService } from 'src/application/application.service';

/**
 * 应用操作守卫 - 用于检查应用是否存在并将应用获取保存到请求对象中
 */
@Injectable()
export class AppActionGuard implements CanActivate {
    constructor(private applicationService: ApplicationService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        let appid: number | null = null;
        if (request.method.toUpperCase() === 'GET') {
            if (request.query && request.query.appid) {
                appid = parseInt(request.query.appid);
            }
        }
        if (request.method.toUpperCase() === 'POST') {
            if (request.body && request.body.appid) {
                appid = parseInt(request.body.appid);
            }
        }
        if (!appid) {
            throw new NotAcceptableException('请传入appid');
        }
        const app = await this.applicationService.getApplicationByIdAndDeveloperId(appid, request.user.id);
        if (!app) {
            throw new NotAcceptableException('应用不存在');
        }
        request.application = app;
        return true;
    }
}
