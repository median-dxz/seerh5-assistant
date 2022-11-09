export type Mod = ReflectObjBase & ModClass;

export class ReflectObjBase {
    [key: string]: any;

    constructor() { }

    reflect(method: string, ...args: any[]) {
        return this[method]?.(args);
    }

    getKeys(): Array<string> {
        return Object.keys(Object.getOwnPropertyDescriptors(this.__proto__)).filter(
            (key) => !key.startsWith('_') && key !== 'constructor'
        );
    }
}
