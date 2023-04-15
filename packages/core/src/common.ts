import { enableMapSet, produce, type Draft } from 'immer';

enableMapSet();

export async function delay(time: number): Promise<void> {
    return new Promise((resolver) => {
        const monitor = setTimeout(() => {
            clearTimeout(monitor);
            resolver();
        }, time);
    });
}

export function wrapper<F extends AnyFunction>(
    func: F,
    beforeDecorator?: (...args: Parameters<F>) => any,
    afterDecorator?: (result: Awaited<ReturnType<F>>, ...args: Parameters<F>) => any
) {
    if (Object.hasOwn(func, 'rawFunction')) {
        func = (func as any).rawFunction;
    }
    const wrappedFunc = async function (this: any, ...args: any[]): Promise<Awaited<ReturnType<F>>> {
        beforeDecorator && (await beforeDecorator.apply(this, args));
        const r = await func.apply(this, arguments);
        afterDecorator && (await afterDecorator.call(this, r, ...args));
        return r;
    };
    (wrappedFunc as any).rawFunction = func;
    return wrappedFunc;
}

export const SAEventTarget = new EventTarget();

export const checkEnv = () =>
    typeof window !== 'undefined' && window.sac != undefined && window.sac?.SacReady && window.sac?.SeerH5Ready;

export const extractObjectId = <T extends { [key in K]: number }, K extends string>(obj: T | number, key: K) => {
    if (typeof obj === 'number') {
        return obj;
    } else {
        return obj[key];
    }
};

type Serializer<T> = (data: T) => string;
type Deserializer<T> = (data: string) => T;

type LocalStorageProxy<T> = {
    ref: T;
    clear(): void;
    use(producer: (data: Draft<T>) => void): void;
} & T;

const StorageMap = new Map<string, LocalStorageProxy<any>>();

export function createLocalStorageProxy<T extends object>(
    key: string,
    defaultValue: T,
    serializer: Serializer<T> = JSON.stringify,
    deserializer: Deserializer<T> = JSON.parse
): LocalStorageProxy<T> {
    key = 'SeerAssistant.' + key;
    if (StorageMap.has(key)) {
        return StorageMap.get(key);
    }
    const serializedData = localStorage.getItem(key);
    let data: T = defaultValue;
    if (serializedData !== null) {
        data = deserializer(serializedData);
    }

    const update = (data: T) => {
        localStorage.setItem(key, serializer(data));
    };

    const storageObject = {
        ref: data,
        use(producer) {
            this.ref = produce(this.ref, producer);
        },
        clear() {
            localStorage.removeItem(key);
        },
    } as LocalStorageProxy<T>;

    const proxyStorageObject = new Proxy(storageObject, {
        get(target, p, receiver) {
            if (Object.hasOwn(target, p)) {
                return Reflect.get(target, p, receiver);
            } else {
                return Reflect.get(target.ref, p, receiver);
            }
        },
        set(target, p, newValue, receiver) {
            let result;
            if (Object.hasOwn(target, p)) {
                result = Reflect.set(target, p, newValue, receiver);
            } else {
                result = Reflect.set(target.ref, p, newValue, receiver);
            }
            if (p === 'ref') {
                update(target.ref);
            }
            return result;
        },
    });

    StorageMap.set(key, proxyStorageObject);
    return proxyStorageObject;
}
