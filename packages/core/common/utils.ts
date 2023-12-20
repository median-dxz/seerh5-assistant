/* eslint-disable */
export type AnyFunction = (...args: any[]) => unknown;
export type Constructor<T> = { new (...args: any[]): T };
export type ValueOf<T> = T[keyof T];
export type WithClass<T> = T & { __class__: string };
export const NOOP = () => {};

class HookedSymbol {
    static readonly original = Symbol('originalFunction');
    static readonly before = Symbol('beforeDecorators');
    static readonly after = Symbol('afterDecorators');
}

/**
 * 延时
 */
export function delay(time: number): Promise<void> {
    return new Promise((resolver) => setTimeout(resolver, time));
}
/**
 * 去抖 所有小于指定间隔的调用只会响应最后一个
 */
export function debounce<F extends AnyFunction>(func: F, time: number) {
    let timer: number | undefined;
    return function (this: unknown, ...args: Parameters<F>) {
        timer && clearTimeout(timer);
        timer = window.setTimeout(() => {
            func.apply(this, args);
        }, time);
    };
}

/**
 * 节流 所有小于指定间隔的调用只会响应第一个
 */
export function throttle<F extends AnyFunction>(func: F, time: number) {
    let timer: number | undefined;
    return function (this: unknown, ...args: Parameters<F>) {
        if (timer) return;
        func.apply(this, args);
        timer = window.setTimeout(() => {
            clearTimeout(timer);
            timer = undefined;
        }, time);
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
    [HookedSymbol.original]: F;
}

interface WrappedFunction<F extends AnyFunction> extends HookedFunction<F> {
    (...args: Parameters<F>): ReturnType<F>;
    [HookedSymbol.after]: AfterDecorator<F>[];
    [HookedSymbol.before]: BeforeDecorator<F>[];
    after(this: WrappedFunction<F>, decorator: AfterDecorator<F>): WrappedFunction<F>;
    before(this: WrappedFunction<F>, decorator: BeforeDecorator<F>): WrappedFunction<F>;
}

export function assertIsHookedFunction<F extends AnyFunction>(func: F | HookedFunction<F>): func is HookedFunction<F> {
    return Object.hasOwn(func, HookedSymbol.original);
}

export function assertIsWrappedFunction<F extends AnyFunction>(
    func: F | WrappedFunction<F>
): func is WrappedFunction<F> {
    return (
        Object.hasOwn(func, HookedSymbol.before) &&
        Object.hasOwn(func, HookedSymbol.after) &&
        assertIsHookedFunction(func)
    );
}

export function wrapper<F extends (...args: any) => any>(func: F | HookedFunction<F> | WrappedFunction<F>) {
    if (typeof func !== 'function') return undefined as never;

    let originalFunc;

    if (assertIsWrappedFunction(func)) {
        return func;
    }

    if (assertIsHookedFunction(func)) {
        originalFunc = func[HookedSymbol.original];
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

        wrapped[HookedSymbol.original] = originalFunction;
        wrapped[HookedSymbol.after] = afterDecorators;
        wrapped[HookedSymbol.before] = beforeDecorators;

        wrapped.before = function (this: WrappedFunction<F>, decorator: BeforeDecorator<F>) {
            return createWrappedFunction(
                this[HookedSymbol.original],
                this[HookedSymbol.before].concat(decorator),
                Array.from(this[HookedSymbol.after])
            );
        }.bind(wrapped);

        wrapped.after = function (this: WrappedFunction<F>, decorator: AfterDecorator<F>) {
            return createWrappedFunction(
                this[HookedSymbol.original],
                Array.from(this[HookedSymbol.before]),
                this[HookedSymbol.after].concat(decorator)
            );
        }.bind(wrapped);

        return wrapped;
    };

    return createWrappedFunction(originalFunc, [], []);
}

type HookFunction<T extends object, K extends keyof T> = T[K] extends (...args: infer P) => infer R
    ? (this: T, originalFunc: (...args: P) => R, ...args: P) => R
    : never;

/**
 * 就地修改函数实现
 * @param target 目标函数的挂载对象
 * @param funcName 目标函数的名称
 * @param hookedFunc 修改后的实现
 */
export function hookFn<T extends object, K extends keyof T>(target: T, funcName: K, hookedFunc?: HookFunction<T, K>) {
    let func = target[funcName] as AnyFunction;
    if (typeof func !== 'function') return;

    if (assertIsHookedFunction(func)) {
        func = func[HookedSymbol.original];
    }

    if (hookedFunc == undefined) return;

    (target[funcName] as any) = function (this: T, ...args: any[]): any {
        return hookedFunc.call(this, func.bind(this), ...args);
    };

    (target[funcName] as any)[HookedSymbol.original] = func;
}

export function restoreHookedFn<T extends object, K extends keyof T>(target: T, funcName: K) {
    let func = target[funcName] as AnyFunction;
    if (typeof func !== 'function') return;

    while (assertIsHookedFunction(func)) {
        func = func[HookedSymbol.original];
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

export { CacheData } from './CacheData.js';

import { disable, enable, setLogger } from './log.js';
export const LogControl = { disable, enable, setLogger };
