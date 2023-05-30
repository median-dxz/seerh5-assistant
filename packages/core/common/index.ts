export type AnyFunction = (...args: any) => any;
export type Constructor<T extends new (...args: any) => any = any> = { new (...args: any[]): InstanceType<T> };

export function delay(time: number): Promise<void> {
    return new Promise((resolver) => setTimeout(resolver, time));
}

export function debounce<F extends AnyFunction>(func: F, wait: number) {
    let timer: number | undefined;
    return function (this: any, ...args: Parameters<F>) {
        timer && clearTimeout(timer);
        timer = window.setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
}

export function wrapper<F extends AnyFunction>(
    func: F,
    beforeDecorator?: (...args: Parameters<F>) => any,
    afterDecorator?: (result: Awaited<ReturnType<F>>, ...args: Parameters<F>) => any
) {
    if (Object.hasOwn(func, 'rawFunction')) {
        func = (func as any).rawFunction;
    }
    const wrappedFunc = async function (this: any, ...args: Parameters<F>): Promise<Awaited<ReturnType<F>>> {
        beforeDecorator && (await beforeDecorator.apply(this, args));
        const r = await func.apply(this, args);
        afterDecorator && (await afterDecorator.call(this, r, ...(args as any[])));
        return r;
    };
    (wrappedFunc as any).rawFunction = func;
    return wrappedFunc;
}

type HookedFunction<T extends object, K extends keyof T> = T[K] extends (...args: infer P) => infer R
    ? (this: T, originalFunc: (...args: P) => R, ...args: P) => R
    : never;

export function hookFn<T extends object, K extends keyof T>(target: T, funcName: K, hookedFunc?: HookedFunction<T, K>) {
    let originalFunc = target[funcName] as Function;
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

export const checkEnv = () =>
    typeof window !== 'undefined' && window.sac != undefined && window.sac?.SacReady && window.sac?.SeerH5Ready;

export const extractObjectId = <T extends { [key in K]: number }, K extends string>(obj: T | number, key: K) => {
    if (typeof obj === 'number') {
        return obj;
    } else {
        return obj[key];
    }
};

export const NULL = () => {};

export { createLocalStorageProxy, type LocalStorageProxy } from './LocalStorage';

export { SAEventTarget } from './SAEventTarget';

export { CacheData } from './CacheData';

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
