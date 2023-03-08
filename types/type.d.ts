declare type AnyFunction = (...args: any) => any;
declare type BindThisFunction<E, F extends AnyFunction> = (this: E, ...args: Parameters<F>) => any;
declare type CallBack<T = any> = (this: T, ...args: any) => any | AnyFunction;
declare type AttrConst<T> = T[keyof T];
