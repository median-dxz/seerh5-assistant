import * as Endpoints from '@sea-launcher/service/endpoints';
import { produce, type Draft } from 'immer';

async function createLocalStorageProxy<T extends object>(key: string, initValue: T) {
    let data: T = await Endpoints.getConfig(key);
    if (data == undefined) data = initValue;
    const observable = {
        ref: data,
        use(producer) {
            this.ref = produce(this.ref, producer);
        },
    } as T & { use(producer: (draft: Draft<T>) => void): void; ref: T };

    const proxy = new Proxy(observable, {
        get(target, prop, receiver) {
            if (Object.hasOwn(target, prop)) {
                return Reflect.get(target, prop, receiver);
            } else {
                return Reflect.get(target.ref as object, prop, receiver);
            }
        },
        set(target, prop, value, receiver) {
            if (prop === 'ref') {
                Endpoints.setConfig(key, value);
                return Reflect.set(target, prop, value, receiver);
            } else {
                target.use((draft) => {
                    (draft as Draft<Record<string | symbol, unknown>>)[prop] = value;
                });
                return true;
            }
        },
    });

    return proxy;
}

export const BattleStrategy = createLocalStorageProxy<{
    dsl: string[][];
    snm: string[][];
}>('BattleStrategy', { dsl: [], snm: [] });

export const PetGroups = createLocalStorageProxy<Array<number[]>>('PetGroups', Array(6).fill((() => [])()));
