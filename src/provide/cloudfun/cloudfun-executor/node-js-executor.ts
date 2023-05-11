import { NotAcceptableException } from '@nestjs/common';

export class NodeJSExecutor {
    private user: any = {};
    private script = '';

    constructor(user: any, script: string) {
        this.user = user;
        this.script = script;
    }

    async run(args: string[]): Promise<string> {
        let code = `
        function $getUser() {
            return ${JSON.stringify(this.user)};
        }
        `;
        for (let i = 0; i < args.length; i++) {
            code += `const $${i} = arguments[${i}];\n`;
        }
        code += 'return (async function() { ' + this.script + ' })();';

        const asyncFunction = new Function(code);
        // eslint-disable-next-line prettier/prettier, prefer-spread
        const result = await asyncFunction.apply(null, args);
        if (result !== undefined && typeof result !== 'string') {
            throw new NotAcceptableException('返回值必须为字符串或不返回');
        }
        return result;
    }
}
