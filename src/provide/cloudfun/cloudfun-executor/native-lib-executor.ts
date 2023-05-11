import { BadGatewayException, NotAcceptableException } from '@nestjs/common';
import koffi from 'koffi';

export class NativeLibExecutor {
    private user: any;
    private fileName: string;
    private functionName: string;

    private static libCaches: Record<string, koffi.IKoffiLib> = {};
    private static functionCaches: Record<string, koffi.KoffiFunction> = {};

    constructor(user: any, fileName: string, functionName: string) {
        this.user = user;
        this.fileName = fileName;
        this.functionName = functionName;
    }

    private getLib(): koffi.IKoffiLib {
        let lib = NativeLibExecutor.libCaches[this.fileName];
        if (!lib) {
            lib = koffi.load(this.fileName);
            NativeLibExecutor.libCaches[this.fileName] = lib;
        }
        return lib;
    }

    private getFunction(argsLength: number): koffi.KoffiFunction {
        const lib = this.getLib();
        const funKey = `${this.fileName}_${this.functionName}_${argsLength}`;
        let fun = NativeLibExecutor.functionCaches[funKey];
        if (fun) return fun;
        if (process.platform === 'win32') {
            const arrTypes = new Array(argsLength + 1).fill('str');
            fun = lib.stdcall(this.functionName, 'str', arrTypes);
            NativeLibExecutor.functionCaches[funKey] = fun;
            return fun;
        } else if (process.platform === 'linux') {
            const arrTypes = new Array(argsLength + 1).fill('str');
            fun = lib.func(this.functionName, 'str', arrTypes);
            NativeLibExecutor.functionCaches[funKey] = fun;
            return fun;
        } else {
            throw new BadGatewayException('不支持的系统');
        }
    }

    async run(args: string[]): Promise<string> {
        const fun = this.getFunction(args.length);
        // eslint-disable-next-line prefer-spread
        const result = fun.apply(null, [JSON.stringify(this.user), ...args]);
        if (result !== undefined && typeof result !== 'string') {
            throw new NotAcceptableException('返回值必须为字符串或不返回');
        }
        return result;
    }
}
