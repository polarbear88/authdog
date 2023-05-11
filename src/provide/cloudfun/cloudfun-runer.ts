import { NotAcceptableException } from '@nestjs/common';
import { Cloudfun } from './cloudfun.entity';
import { VMJSExecutor } from './cloudfun-executor/vm-js-executor';
import { NodeJSExecutor } from './cloudfun-executor/node-js-executor';
import { NativeLibExecutor } from './cloudfun-executor/native-lib-executor';
export class CloudfunRuner {
    static async run(cf: Cloudfun, args: string[], user: any, reduceUserBalance: (balance: number, reason: string) => void): Promise<string> {
        if (cf.type === 'VM-JS') {
            return await new VMJSExecutor(user, cf.script, reduceUserBalance).run(args);
        }
        if (cf.type === 'NODE-JS') {
            return await new NodeJSExecutor(user, cf.script).run(args);
        }
        if (cf.type === 'NATIVE-LIB') {
            return await new NativeLibExecutor(user, cf.script, cf.funName).run(args);
        }
        throw new NotAcceptableException('不支持的类型');
    }
}
