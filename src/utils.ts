async function delay(time: number): Promise<void> {
    return new Promise((resolver) => {
        const monitor = setTimeout(() => {
            clearTimeout(monitor);
            resolver();
        }, time);
    });
}


function warpper(func: () => any, beforeDecorator?: () => any, afterDecorator?: () => any): () => any {
    return async function () {
        beforeDecorator && (await beforeDecorator.apply(this, arguments));
        const r = await func.apply(this, arguments);
        afterDecorator && (await afterDecorator.apply(this, arguments));
        return r;
    };
}

export { warpper, delay };
