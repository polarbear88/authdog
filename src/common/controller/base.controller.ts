export class BaseController {
    public async buildResponse(message = 'success', data: any = {}, statusCode = 200) {
        return {
            statusCode,
            message,
            data,
        };
    }
}
