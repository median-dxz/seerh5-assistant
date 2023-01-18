async function delay(time: number): Promise<void> {
    return new Promise((resolver) => {
        const monitor = setTimeout(() => {
            clearTimeout(monitor);
            resolver();
        }, time);
    });
}

function wrapper<F extends AnyFunction>(
    func: F,
    beforeDecorator?: (...args: Parameters<F>) => any,
    afterDecorator?: (result: Awaited<ReturnType<F>>, ...args: Parameters<F>) => any
) {
    const wrappedFunc = async function (this: any, ...args: any[]): Promise<Awaited<ReturnType<F>>> {
        beforeDecorator && (await beforeDecorator.apply(this, args));
        const r = await func.apply(this, arguments);
        afterDecorator && (await afterDecorator.call(this, r, ...args));
        return r;
    };
    (wrappedFunc as any).rawFunction = func;
    return wrappedFunc;
}

export { wrapper, delay };

