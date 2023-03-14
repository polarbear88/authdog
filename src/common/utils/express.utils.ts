import { Request } from 'express';

export class ExpressUtils {
    static getIp(req: Request | Record<string, any>): string {
        return (req.ips.length ? req.ips[0] : req.ip).split(':').pop();
    }
}
