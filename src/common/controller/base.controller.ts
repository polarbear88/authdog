export class BaseController {
    public setAffected(data: any, affected: string): void {
        data.affected = affected;
    }
}
