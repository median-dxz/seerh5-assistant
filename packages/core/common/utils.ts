/* eslint-disable */
export type AnyFunction = (...args: any[]) => unknown;
export type Constructor<T extends new (...args: any) => unknown> = { new (...args: any[]): InstanceType<T> };

export function delay(time: number): Promise<void> {
    return new Promise((resolver) => setTimeout(resolver, time));
}

export function debounce<F extends AnyFunction>(func: F, wait: number) {
    let timer: number | undefined;
    return function (this: unknown, ...args: Parameters<F>) {
        timer && clearTimeout(timer);
        timer = window.setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
}

export function wrapperAsync<F extends (...args: any) => PromiseLike<R>, R>(
    func: F,
    beforeDecorator?: (...args: Parameters<F>) => void | Promise<void>,
    afterDecorator?: (result: R, ...args: Parameters<F>) => void | Promise<void>
) {
    if (Object.hasOwn(func, 'rawFunction')) {
        func = (func as any).rawFunction;
    }
    const wrappedFunc = async function (this: unknown, ...args: Parameters<F>): Promise<R> {
        beforeDecorator && (await beforeDecorator.apply(this, args));
        const r = await func.apply(this, args);
        afterDecorator && (await afterDecorator.call(this, r, ...args));
        return r;
    };
    (wrappedFunc as any).rawFunction = func;
    return wrappedFunc;
}

export function wrapper<F extends (...args: any) => any>(
    func: F,
    beforeDecorator?: (...args: Parameters<F>) => void,
    afterDecorator?: (result: ReturnType<F>, ...args: Parameters<F>) => void
) {
    if (Object.hasOwn(func, 'rawFunction')) {
        func = (func as any).rawFunction;
    }
    const wrappedFunc = function (this: unknown, ...args: Parameters<F>): ReturnType<F> {
        beforeDecorator && beforeDecorator.apply(this, args);
        const r = func.apply(this, args);
        afterDecorator && afterDecorator.call(this, r, ...args);
        return r;
    };
    (wrappedFunc as any).rawFunction = func;
    return wrappedFunc;
}

type HookedFunction<T extends object, K extends keyof T> = T[K] extends (...args: infer P) => infer R
    ? (this: T, originalFunc: (...args: P) => R, ...args: P) => R
    : never;

export function hookFn<T extends object, K extends keyof T>(target: T, funcName: K, hookedFunc?: HookedFunction<T, K>) {
    let originalFunc = target[funcName] as AnyFunction;
    if (typeof originalFunc !== 'function') return;

    if (Object.hasOwn(originalFunc, 'rawFunction')) {
        originalFunc = (originalFunc as any).rawFunction;
    }

    if (hookedFunc == undefined) return;

    (target[funcName] as any) = function (this: T, ...args: any[]): any {
        return hookedFunc.call(this, originalFunc.bind(this), ...args);
    };

    (target[funcName] as any).rawFunction = originalFunc;
}

interface HasPrototype {
    prototype: object;
}

export function hookPrototype<T extends HasPrototype, K extends keyof T['prototype']>(
    target: T,
    funcName: K,
    hookedFunc?: HookedFunction<T['prototype'], K>
) {
    const proto = target.prototype;
    proto && hookFn(proto, funcName, hookedFunc);
}

export function restoreHookedFn<T extends object, K extends keyof T>(target: T, funcName: K) {
    let fn = target[funcName] as AnyFunction;
    if (typeof fn !== 'function') return;

    while (Object.hasOwn(fn, 'rawFunction')) {
        fn = (fn as any).rawFunction;
    }
    (target[funcName] as any) = fn;
}

export const checkEnv = () =>
    typeof window !== 'undefined' && window.sea != undefined && window.sea?.CoreReady && window.sea?.SeerH5Ready;

export const extractObjectId = <T extends { [key in K]: number }, K extends string>(obj: T | number, key: K) => {
    if (typeof obj === 'number') {
        return obj;
    } else {
        return obj[key];
    }
};

export const NOOP = () => {};

export { SEAHookEventTarget as SEAHookEmitter } from './EventTarget.js';

export { CacheData } from './CacheData.js';

export function tryGet<TKey, TValue>(map: Map<TKey, Set<TValue>>, key: TKey) {
    if (!map.has(key)) {
        map.set(key, new Set());
    }
    return map.get(key)!;
}

export const CoreModuleWarning = (module: string): typeof console.warn => {
    return console.warn.bind(console, '[%s]:', module);
};
