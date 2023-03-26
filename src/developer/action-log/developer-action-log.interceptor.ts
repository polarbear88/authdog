import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExpressUtils } from 'src/common/utils/express.utils';
import { DeveloperActionLog } from './developer-action-log.entity';
import { DeveloperActionLogService } from './developer-action-log.service';
import { Reflector } from '@nestjs/core';
import { IS_WRITE_DEVELOPER_ACTION_LOG } from './write-developer-action-log.decorator';

@Injectable()
export class DeveloperActionLogInterceptor implements NestInterceptor {
    constructor(private developerActionLogService: DeveloperActionLogService, private reflector: Reflector) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const action = this.reflector.getAllAndOverride(IS_WRITE_DEVELOPER_ACTION_LOG, [context.getHandler(), context.getClass()]);
        if (!action) return next.handle(); // 不记录日志
        const req = context.switchToHttp().getRequest();
        return next.handle().pipe(
            map((data) => {
                const developerActionLog = new DeveloperActionLog();
                developerActionLog.developerId = req.user.id;
                developerActionLog.url = req.url;
                developerActionLog.method = req.method;
                developerActionLog.ip = ExpressUtils.getIp(req);
                developerActionLog.action = action;
                developerActionLog.username = req.user.username;
                if (req.application) {
                    developerActionLog.appid = req.application.id;
                    developerActionLog.appname = req.application.name;
                }
                let affected = null;
                if (data && data.affected) {
                    affected = data.affected;
                }
                developerActionLog.affected = affected;
                this.developerActionLogService.createDeveloperActionLog(developerActionLog);
                return data;
            }),
        );
    }
}
