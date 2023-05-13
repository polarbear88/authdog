import koffi from 'koffi';

function getLib(fileName: string): koffi.IKoffiLib {
    let lib = global.libCaches[fileName];
    if (!lib) {
        lib = koffi.load(fileName);
        global.libCaches[fileName] = lib;
    }
    return lib;
}

function getFunction(fileName: string, functionName: string, argsLength: number): koffi.KoffiFunction {
    const lib = getLib(fileName);
    const funKey = `${fileName}_${functionName}_${argsLength}`;
    let fun = global.functionCaches[funKey];
    if (fun) return fun;
    if (process.platform === 'win32') {
        const arrTypes = new Array(argsLength).fill('str');
        fun = lib.stdcall(functionName, 'str', arrTypes);
        global.functionCaches[funKey] = fun;
        return fun;
    } else if (process.platform === 'linux') {
        const arrTypes = new Array(argsLength).fill('str');
        fun = lib.func(functionName, 'str', arrTypes);
        global.functionCaches[funKey] = fun;
        return fun;
    } else {
        throw new Error('不支持的系统');
    }
}

export default (fileName: any, functionName: string, args: string[]) => {
    const fun = getFunction(fileName, functionName, args.length);
    // eslint-disable-next-line prefer-spread
    return fun.apply(null, args);
};
