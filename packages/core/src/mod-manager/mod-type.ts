declare interface ModClass {
    init: VoidFunction;
    run?: VoidFunction;
    update?: VoidFunction;
    meta: {
        id: string;
        description: string;
    };
}

export class Mod implements ModClass {
    [key: string]: any;

    constructor() {}

    reflect(method: string, ...args: any[]) {
        return this[method]?.(args);
    }

    getKeys(): string[] {
        return Object.keys(Object.getOwnPropertyDescriptors(this.__proto__)).filter(
            (key) => !key.startsWith('_') && !['getKeys', 'getParameterList', 'reflect', 'constructor'].includes(key)
        );
    }

    getParameterList(method: string): string[] {
        if (typeof this[method] === 'function') {
            return /\(\s*([\s\S]*?)\s*\)/.exec(this[method])![1].split(/\s*,\s*/);
        }
        throw new TypeError(`${method} not a function`);
    }

    init() {}
    meta = { id: '', description: '' };
}
