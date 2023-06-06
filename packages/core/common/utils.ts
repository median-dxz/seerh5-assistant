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

export const checkEnv = () => typeof window !== 'undefined' && window.sac != undefined && window.sac?.SacReady && window.sac?.SeerH5Ready;

export const extractObjectId = <T extends { [key in K]: number }, K extends string>(obj: T | number, key: K) => {
    if (typeof obj === 'number') {
        return obj;
    } else {
        return obj[key];
    }
};

export const NULL = () => {};

export { createLocalStorageProxy, type LocalStorageProxy } from './LocalStorage.js';

export { SAEventTarget } from './SAEventTarget.js';

export { CacheData } from './CacheData.js';

export function tryGet<TKey, TValue>(map: Map<TKey, Set<TValue>>, key: TKey) {
    if (!map.has(key)) {
        map.set(key, new Set());
    }
    return map.get(key)!;
}

import chalk, { ChalkInstance } from 'chalk';

chalk.level = 3;

export const defaultStyle = {
    mod: chalk.hex('#fc9667'),
    core: chalk.hex('#e067fc'),
    none: chalk.bgHex('#eff1f3'),
} as const;

export const SaModuleLogger = (module: string, fontStyle: ChalkInstance = defaultStyle.none): typeof console.log => {
    return console.log.bind(console, fontStyle('[%s]:'), module);
};
