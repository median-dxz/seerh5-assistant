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
    afterDecorator?: (...args: Parameters<F>) => any
) {
    return async function (this: any, ...args: Parameters<F>): Promise<Awaited<ReturnType<F>>> {
        beforeDecorator && (await beforeDecorator.apply(this, arguments));
        const r = await func.apply(this, arguments);
        afterDecorator && (await afterDecorator.apply(this, arguments));
        return r;
    };
}

export { wrapper, delay };
