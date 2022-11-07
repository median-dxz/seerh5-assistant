async function delay(time: number): Promise<void> {
    return new Promise((resolver) => {
        const monitor = setTimeout(() => {
            clearTimeout(monitor);
            resolver();
        }, time);
    });
}

type AnyFunction = (...args: any) => any;
type BindThisFunction<F extends AnyFunction> = (this: ThisParameterType<F>, ...args: any) => ReturnType<F>;
type AsyncFunction<F extends AnyFunction> = (...args: unknown[]) => Promise<ReturnType<F>>;

function wrapper<E, F extends AnyFunction = (this: E, ...args: unknown[]) => unknown>(
    func: F,
    beforeDecorator?: BindThisFunction<F>,
    afterDecorator?: BindThisFunction<F>
): AsyncFunction<F> {
    return async function (this: ThisParameterType<F>) {
        beforeDecorator && (await beforeDecorator.apply(this, arguments));
        const r = await func.apply(this, arguments);
        afterDecorator && (await afterDecorator.apply(this, arguments));
        return r;
    };
}

export { wrapper, delay };

