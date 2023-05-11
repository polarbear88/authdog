import { NotAcceptableException } from '@nestjs/common';
import ivm from 'isolated-vm';
export class VMJSExecutor {
    private isolate: ivm.Isolate;
    private context: ivm.Context;
    private jail: ivm.Reference<Record<string | number | symbol, any>>;
    private user: any = {};
    private script = '';
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private reduceUserBalance: (balance: number, reason: string) => void = () => {};

    constructor(user: any, script: string, reduceUserBalance: (balance: number, reason: string) => void) {
        this.user = user;
        this.script = script;
        this.reduceUserBalance = reduceUserBalance;
        this.isolate = new ivm.Isolate({ memoryLimit: 32 });
        this.context = this.isolate.createContextSync();
        this.jail = this.context.global;
        this.jail.setSync('global', this.jail.derefInto());
        this.jail.setSync('$getUser', () => {
            return this.user;
        });
        this.jail.setSync('$reduceUserBalance', (balance: number, reason: string) => {
            this.reduceUserBalance(balance, reason);
        });
    }

    async run(args: string[]): Promise<string> {
        const result = await this.context.evalClosureSync(this.script, args, { timeout: 3000 });
        this.context.release();
        this.isolate.dispose();
        if (result !== undefined && typeof result !== 'string') {
            throw new NotAcceptableException('返回值必须为字符串或不返回');
        }
        return result;
    }
}
