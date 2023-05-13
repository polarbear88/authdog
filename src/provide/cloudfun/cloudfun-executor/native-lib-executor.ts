import { NotAcceptableException } from '@nestjs/common';
import path from 'path';
import Piscina from 'piscina';

export class NativeLibExecutor {
    private user: any;
    private fileName: string;
    private functionName: string;

    private static threadCount = process.env.NATIVE_LIB_EXECUTOR_THREAD_POOL_SIZE ? parseInt(process.env.NATIVE_LIB_EXECUTOR_THREAD_POOL_SIZE) : 10;
    private static piscina: Piscina = new Piscina({
        filename: path.resolve(__dirname, 'narive-lib-worker.js'),
        minThreads: this.threadCount,
        maxThreads: this.threadCount,
    });

    constructor(user: any, fileName: string, functionName: string) {
        this.user = user;
        this.fileName = fileName;
        this.functionName = functionName;
    }

    async run(args: string[]): Promise<string> {
        // 为了避免本机库的调用阻塞node主线程导致整个后端服务阻塞，这里使用piscina线程池来调用
        const result = await NativeLibExecutor.piscina.run({
            fileName: this.fileName,
            functionName: this.functionName,
            args: [JSON.stringify(this.user), ...args],
        });
        if (result !== undefined && typeof result !== 'string') {
            throw new NotAcceptableException('返回值必须为字符串或不返回');
        }
        return result;
    }
}
