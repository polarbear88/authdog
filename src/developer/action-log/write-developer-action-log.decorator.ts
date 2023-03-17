import { CustomDecorator, SetMetadata, UseInterceptors } from '@nestjs/common';
import { DeveloperActionLogInterceptor } from './developer-action-log.interceptor';

export const IS_WRITE_DEVELOPER_ACTION_LOG = 'writeDeveloperActionLog';
// 设置要求写入操作日志的装饰器
export const WriteDeveloperActionLog = (action: string): MethodDecorator => {
    return (target: any, propertyKey: string | symbol, descriptor: any) => {
        SetMetadata(IS_WRITE_DEVELOPER_ACTION_LOG, action)(target, propertyKey, descriptor);
        UseInterceptors(DeveloperActionLogInterceptor)(target, propertyKey, descriptor);
    };
};
