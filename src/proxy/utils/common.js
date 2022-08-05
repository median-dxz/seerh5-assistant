async function delay(time) {
    return new Promise((resolver) => {
        const monitor = setTimeout(() => {
            clearTimeout(monitor);
            resolver();
        }, time);
    });
}

function warpper(func, beforeDecorator, afterDecorator) {
    return async function () {
        beforeDecorator && (await beforeDecorator.apply(this, arguments));
        let r = await func.apply(this, arguments);
        afterDecorator && (await afterDecorator.apply(this, arguments));
        return r;
    };
}

async function runWithCheckTimes(worker, checker) {
    let times = await checker();
    while (times--) {
        await worker();
    }
}

export { warpper, delay, runWithCheckTimes };
