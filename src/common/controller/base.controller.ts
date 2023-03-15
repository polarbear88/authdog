export class BaseController {
    public async buildResponse(message = 'success', data: any = {}, statusCode = 200) {
        if (data && data._serialization && typeof data._serialization === 'function') {
            // 序列化数据，清理敏感信息
            data = data._serialization();
        }
        return {
            statusCode,
            message,
            data,
        };
    }
}
