import { Request } from 'express';

export class ExpressUtils {
    static getIp(req: Request | Record<string, any>): string {
        return (req.ips.length ? req.ips[0] : req.ip).split(':').pop();
    }

    static buildResponse(message = 'success', data: any = {}, statusCode = 200) {
        if (data && data._serialization && typeof data._serialization === 'function') {
            // 序列化数据，清理敏感信息
            data = data._serialization();
        }
        return {
            statusCode,
            message,
            data,
            timestamp: new Date().getTime(),
        };
    }
}
