declare interface ModClass {
    init: VoidFunction;
    run?: VoidFunction;
    update?: VoidFunction;
    meta: {
        id: string;
        description: string;
    };
}

export abstract class Mod implements ModClass {
    constructor() {}

    reflect(method: string, ...args: any[]) {
        return (this as any)[method]?.(args);
    }

    getKeys(): string[] {
        return Object.keys(Object.getOwnPropertyDescriptors((this as any).__proto__)).filter(
            (key) => !key.startsWith('_') && !['getKeys', 'getParameterList', 'reflect', 'constructor'].includes(key)
        );
    }

    getParameterList(method: string): string[] {
        const prop = (this as any)[method];
        if (typeof prop === 'function') {
            return /\(\s*([\s\S]*?)\s*\)/.exec(prop)![1].split(/\s*,\s*/);
        }
        throw new TypeError(`${method} not a function`);
    }

    abstract init(): void;
    abstract meta: { id: string; description: string };
}
