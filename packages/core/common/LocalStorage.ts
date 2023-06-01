import { produce, type Draft } from 'immer';

type Serializer<T> = (data: T) => string;
type Deserializer<T> = (data: string) => T;

export type LocalStorageProxy<T> = {
    ref: T;
    clear(): void;
    use(producer: (data: Draft<T>) => void): void;
} & T;

const StorageMap = new Map<string, LocalStorageProxy<unknown>>();

export function createLocalStorageProxy<T extends object>(
    key: string,
    defaultValue: T,
    serializer: Serializer<T> = JSON.stringify,
    deserializer: Deserializer<T> = JSON.parse
): LocalStorageProxy<T> {
    key = 'SeerAssistant.' + key;
    if (StorageMap.has(key)) {
        return StorageMap.get(key) as LocalStorageProxy<T>;
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
