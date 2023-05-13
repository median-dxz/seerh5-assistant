declare type AnyFunction = (...args: any) => any;
declare type Constructor<T = any> = { new (...args: any[]): InstanceType<T> };
declare type CallBack<T = any> = (this: T, ...args: any) => any | AnyFunction;
declare type AttrConst<T> = T[keyof T];
declare type Dict<T extends object> = Record<string | number, T>;
