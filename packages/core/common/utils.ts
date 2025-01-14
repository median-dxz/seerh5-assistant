import { getLogger } from './logger.js';

/* eslint-disable */
export type AnyFunction = (...args: any[]) => any;
export type Constructor<T> = { new (...args: any[]): T };
export type ValueOf<T> = T[keyof T];
export type WithClass<T> = T & { __class__: string };
export const NOOP = () => {};
// @ts-expect-error
export const IS_DEV = process.env.NODE_ENV !== 'production';

export class HookedSymbol {
    static readonly kOriginal = Symbol('originalFunction');
    static readonly kBefore = Symbol('beforeDecorators');
    static readonly kAfter = Symbol('afterDecorators');
}

/** 延时 */
export function delay(time: number): Promise<void> {
    return new Promise((resolver) => setTimeout(resolver, time));
}
/** 去抖 所有小于指定间隔的调用只会在最后一个超时后响应 */
export function debounce<F extends AnyFunction>(func: F, time: number) {
    let timer: number | undefined;
    return function (this: unknown, ...args: Parameters<F>) {
        timer && clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, time);
    };
}

/** 节流 所有小于指定间隔的调用只会响应第一个 */
export function throttle<F extends AnyFunction>(func: F, time: number) {
    let timer: number | undefined;
    return function (this: unknown, ...args: Parameters<F>) {
        if (timer) return;
        func.apply(this, args);
        timer = setTimeout(() => {
            clearTimeout(timer);
            timer = undefined;
        }, time);
    };
}

const hookLogger = getLogger('hook');

type InferPromiseResultType<T> = T extends PromiseLike<infer TResult> ? TResult : T;
type ConvertVoid<T> = T extends void ? undefined : T;

type BeforeDecorator<F extends AnyFunction> = (...args: Parameters<F>) => void;
type AfterDecorator<F extends AnyFunction> = (
    result: ConvertVoid<InferPromiseResultType<ReturnType<F>>>,
    ...args: Parameters<F>
) => void;

export interface HookedFunction<F extends AnyFunction> {
    (...args: Parameters<F>): ReturnType<F>;
    [HookedSymbol.kOriginal]: F;
}

export interface WrappedFunction<F extends AnyFunction> extends HookedFunction<F> {
    (...args: Parameters<F>): ReturnType<F>;
    [HookedSymbol.kAfter]: AfterDecorator<F>[];
    [HookedSymbol.kBefore]: BeforeDecorator<F>[];
    after(this: WrappedFunction<F>, decorator: AfterDecorator<F>): WrappedFunction<F>;
    before(this: WrappedFunction<F>, decorator: BeforeDecorator<F>): WrappedFunction<F>;
}

export function assertIsHookedFunction<F extends AnyFunction>(func: F | HookedFunction<F>): func is HookedFunction<F> {
    return Object.hasOwn(func, HookedSymbol.kOriginal);
}

export function assertIsWrappedFunction<F extends AnyFunction>(
    func: F | WrappedFunction<F>
): func is WrappedFunction<F> {
    return (
        Object.hasOwn(func, HookedSymbol.kBefore) &&
        Object.hasOwn(func, HookedSymbol.kAfter) &&
        assertIsHookedFunction(func)
    );
}

export function wrapper<F extends AnyFunction>(func: F | HookedFunction<F> | WrappedFunction<F>) {
    if (typeof func !== 'function') return undefined as never;

    const createWrappedFunction = (
        originalFunction: F,
        beforeDecorators: BeforeDecorator<F>[],
        afterDecorators: AfterDecorator<F>[]
    ) => {
        const wrapped = function (this: unknown, ...args: Parameters<F>): ReturnType<F> {
            beforeDecorators.forEach((decorator) => {
                decorator.apply(this, args);
            });

            const r = originalFunction.apply(this, args);

            afterDecorators.forEach((decorator) => {
                if (r instanceof Promise) {
                    r.then((r) => decorator.call(this, r, ...args));
                } else {
                    decorator.call(this, r, ...args);
                }
            });
            return r;
        } as WrappedFunction<F>;

        wrapped[HookedSymbol.kOriginal] = originalFunction;
        wrapped[HookedSymbol.kBefore] = beforeDecorators;
        wrapped[HookedSymbol.kAfter] = afterDecorators;

        wrapped.before = function (this: WrappedFunction<F>, decorator: BeforeDecorator<F>) {
            return createWrappedFunction(
                this[HookedSymbol.kOriginal],
                this[HookedSymbol.kBefore].concat(decorator),
                Array.from(this[HookedSymbol.kAfter])
            );
        }.bind(wrapped);

        wrapped.after = function (this: WrappedFunction<F>, decorator: AfterDecorator<F>) {
            return createWrappedFunction(
                this[HookedSymbol.kOriginal],
                Array.from(this[HookedSymbol.kBefore]),
                this[HookedSymbol.kAfter].concat(decorator)
            );
        }.bind(wrapped);

        return wrapped;
    };

    if (assertIsWrappedFunction(func)) {
        return createWrappedFunction(
            func[HookedSymbol.kOriginal],
            [...func[HookedSymbol.kBefore]],
            [...func[HookedSymbol.kAfter]]
        );
    }

    return createWrappedFunction(func as F, [], []);
}

type HookFunction<T extends object, K extends keyof T> = T[K] extends (...args: infer P) => infer R
    ? (this: T, originalFunc: (...args: P) => R, ...args: P) => R
    : never;

/**
 * 就地修改函数实现
 * @param target 目标函数的挂载对象
 * @param funcName 目标函数的名称
 * @param override 修改后的实现
 */
export function hookFn<T extends object, K extends keyof T>(target: T, funcName: K, override: HookFunction<T, K>) {
    let func = target[funcName] as AnyFunction;
    if (typeof func !== 'function') return;

    hookLogger.info(`hookFn: ${String(funcName)}`);

    if (assertIsHookedFunction(func)) {
        IS_DEV && console.warn(`检测到对 ${String(funcName)} 的重复hook行为, 最后一次hook将覆盖之前的所有修改`);
        hookLogger.warn(`hookFn: ${String(funcName)} 作为HookedFn被覆写`);
    }

    while (assertIsHookedFunction(func)) {
        func = func[HookedSymbol.kOriginal];
    }

    (target[funcName] as any) = function (this: T, ...args: any[]): any {
        return override.call(this, func.bind(this), ...args);
    };

    (target[funcName] as any)[HookedSymbol.kOriginal] = func;
}

/** 还原被修改的函数 */
export function restoreHookedFn<T extends object, K extends keyof T>(target: T, funcName: K) {
    let func = target[funcName] as AnyFunction;
    if (typeof func !== 'function') return;

    hookLogger.info(`restoreHookedFn: ${String(funcName)}`);

    while (assertIsHookedFunction(func)) {
        func = func[HookedSymbol.kOriginal];
    }

    (target[funcName] as any) = func;
}

interface HasPrototype<T> {
    prototype: T;
}

export function hookPrototype<T extends object, K extends keyof T>(
    target: HasPrototype<T>,
    funcName: K,
    override: HookFunction<T, K>
) {
    const proto = target.prototype;
    proto && hookFn(proto, funcName, override);
}

export function hookConstructor<TClass extends Constructor<any>>(
    classType: TClass,
    className: string,
    override: (ins: InstanceType<TClass>, ...args: ConstructorParameters<TClass>) => void
) {
    hookFn(globalThis as any, className, (_, ...args) => {
        const ins = new classType(...args);
        override(ins, ...(args as ConstructorParameters<TClass>));
        return ins;
    });
}
