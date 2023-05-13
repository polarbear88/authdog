export default (fun: any, args: string[]) => {
    // eslint-disable-next-line prefer-spread
    return fun.apply(null, args);
};
