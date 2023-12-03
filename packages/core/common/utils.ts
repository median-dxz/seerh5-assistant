/* eslint-disable */
export type AnyFunction = (...args: any[]) => unknown;
export type Constructor<T extends new (...args: any) => unknown> = { new (...args: any[]): InstanceType<T> };
export type ValueOf<T> = T[keyof T];
export type Handler<T> = (data: T) => void;
export type withClass<T> = T & { __class__: string };

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

type InferPromiseResultType<T> = T extends PromiseLike<infer TResult> ? TResult : T;
type ConvertVoid<T> = T extends void ? undefined : T;

type BeforeDecorator<F extends AnyFunction> = (...args: Parameters<F>) => void;
type AfterDecorator<F extends AnyFunction> = (
    result: ConvertVoid<InferPromiseResultType<ReturnType<F>>>,
    ...args: Parameters<F>
) => void;

interface HookedFunction<F extends AnyFunction> {
    (...args: Parameters<F>): ReturnType<F>;
    originalFunction: F;
}

interface WrappedFunction<F extends AnyFunction> extends HookedFunction<F> {
    (...args: Parameters<F>): ReturnType<F>;
    afterDecorators: AfterDecorator<F>[];
    beforeDecorators: BeforeDecorator<F>[];
    after(this: WrappedFunction<F>, decorator: AfterDecorator<F>): WrappedFunction<F>;
    before(this: WrappedFunction<F>, decorator: BeforeDecorator<F>): WrappedFunction<F>;
}

export function assertIsHookedFunction<F extends AnyFunction>(func: F | HookedFunction<F>): func is HookedFunction<F> {
    return 'originalFunction' in func;
}

export function assertIsWrappedFunction<F extends AnyFunction>(
    func: F | WrappedFunction<F>
): func is WrappedFunction<F> {
    return 'afterDecorators' in func && 'beforeDecorators' in func && assertIsHookedFunction(func);
}

export function wrapper<F extends (...args: any) => any>(func: F | HookedFunction<F> | WrappedFunction<F>) {
    if (typeof func !== 'function') return undefined as never;

    let originalFunc;

    if (assertIsWrappedFunction(func)) {
        return func;
    }

    if (assertIsHookedFunction(func)) {
        originalFunc = func.originalFunction;
    } else {
        originalFunc = func;
    }

    const createWrappedFunction = (
        originalFunction: F,
        beforeDecorators: BeforeDecorator<F>[],
        afterDecorators: AfterDecorator<F>[]
    ) => {
        const wrapped = function (this: unknown, ...args: Parameters<F>): ReturnType<F> {
            beforeDecorators.forEach((decorator) => {
                decorator.apply(this, args);
            });

            const r = func.apply(this, args);

            afterDecorators.forEach((decorator) => {
                if (r instanceof Promise) {
                    r.then((r) => decorator.call(this, r, ...args));
                } else {
                    decorator.call(this, r, ...args);
                }
            });
            return r;
        } as WrappedFunction<F>;

        wrapped.originalFunction = originalFunction;
        wrapped.afterDecorators = afterDecorators;
        wrapped.beforeDecorators = beforeDecorators;

        wrapped.before = function (this: WrappedFunction<F>, decorator: BeforeDecorator<F>) {
            return createWrappedFunction(
                this.originalFunction,
                this.beforeDecorators.concat(decorator),
                Array.from(this.afterDecorators)
            );
        }.bind(wrapped);

        wrapped.after = function (this: WrappedFunction<F>, decorator: AfterDecorator<F>) {
            return createWrappedFunction(
                this.originalFunction,
                Array.from(this.beforeDecorators),
                this.afterDecorators.concat(decorator)
            );
        }.bind(wrapped);

        return wrapped;
    };

    return createWrappedFunction(originalFunc, [], []);
}

type HookFunction<T extends object, K extends keyof T> = T[K] extends (...args: infer P) => infer R
    ? (this: T, originalFunc: (...args: P) => R, ...args: P) => R
    : never;

export function hookFn<T extends object, K extends keyof T>(target: T, funcName: K, hookedFunc?: HookFunction<T, K>) {
    let func = target[funcName] as AnyFunction;
    if (typeof func !== 'function') return;

    if (Object.hasOwn(func, 'originalFunction')) {
        func = (func as any).originalFunction;
    }

    if (hookedFunc == undefined) return;

    (target[funcName] as any) = function (this: T, ...args: any[]): any {
        return hookedFunc.call(this, func.bind(this), ...args);
    };

    (target[funcName] as any).originalFunction = func;
}

export function restoreHookedFn<T extends object, K extends keyof T>(target: T, funcName: K) {
    let func = target[funcName] as AnyFunction;
    if (typeof func !== 'function') return;

    while (Object.hasOwn(func, 'originalFunction')) {
        func = (func as any).originalFunction;
    }

    (target[funcName] as any) = func;
}

interface HasPrototype {
    prototype: object;
}

export function hookPrototype<T extends HasPrototype, K extends keyof T['prototype']>(
    target: T,
    funcName: K,
    hookedFunc?: HookFunction<T['prototype'], K>
) {
    const proto = target.prototype;
    proto && hookFn(proto, funcName, hookedFunc);
}

export function tryGet<TKey, TValue>(map: Map<TKey, Set<TValue>>, key: TKey) {
    if (!map.has(key)) {
        map.set(key, new Set());
    }
    return map.get(key)!;
}

export const NOOP = () => {};

export { CacheData } from './CacheData.js';

import { ModuleName, disable, enable, setLogger } from './log.js';
export const log = { ModuleName, disable, enable, setLogger };
