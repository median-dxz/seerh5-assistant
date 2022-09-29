async function delay(time: number): Promise<void> {
    return new Promise((resolver) => {
        const monitor = setTimeout(() => {
            clearTimeout(monitor);
            resolver();
        }, time);
    });
}

type FnAsynify<T extends (...args: any[]) => unknown> = () => Promise<ReturnType<T>>;

function wrapper<Fn extends (...args: any[]) => unknown>(func: Fn, beforeDecorator?: Fn, afterDecorator?: Fn): FnAsynify<Fn> {
    return async function () {
        beforeDecorator && (await beforeDecorator.apply(this, arguments));
        const r: ReturnType<Fn> = await func.apply(this, arguments);
        afterDecorator && (await afterDecorator.apply(this, arguments));
        return r;
    };
}

export { wrapper as wrapper, delay };

