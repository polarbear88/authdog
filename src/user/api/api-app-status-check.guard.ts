// 用于检查应用状态和开发者状态的守卫
import { Injectable, CanActivate, ExecutionContext, NotAcceptableException } from '@nestjs/common';
import { Application } from 'src/provide/application/application.entity';
import { DeveloperService } from 'src/developer/developer.service';

/**
 * 用于检查应用状态和开发者状态的守卫
 */
@Injectable()
export class ApiAppStatusCheckGuard implements CanActivate {
    constructor(private developerService: DeveloperService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const app = request.application as Application;
        if (app.status !== 'published') {
            throw new NotAcceptableException('应用已被禁用');
        }
        if ((await this.developerService.getStatus(app.developerId)) !== 'normal') {
            throw new NotAcceptableException('开发者已被禁用');
        }
        return true;
    }
}
