/**
 * @param {number} time
 * @returns {Promise<void>}
 */
async function delay(time) {
    return new Promise((resolver) => {
        const monitor = setTimeout(() => {
            clearTimeout(monitor);
            resolver();
        }, time);
    });
}

/**
 * @param {Function} func
 * @param {Function} beforeDecorator
 * @param {Function} afterDecorator
 */
function warpper(func, beforeDecorator, afterDecorator) {
    return async function () {
        beforeDecorator && (await beforeDecorator.apply(this, arguments));
        const r = await func.apply(this, arguments);
        afterDecorator && (await afterDecorator.apply(this, arguments));
        return r;
    };
}

export { warpper, delay };
