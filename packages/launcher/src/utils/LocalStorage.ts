import * as Endpoints from '@sea-launcher/service/endpoints';
import { enableMapSet, produce, type Draft } from 'immer';

enableMapSet();

export async function createLocalStorageProxy<T extends object>(
    key: string,
    initValue: T,
    mutation: (value: T) => void
) {
    const observable = {
        ref: initValue,
        use(producer) {
            this.ref = produce(this.ref, producer);
        }
    } as T & { use(producer: (draft: Draft<T>) => void): void; ref: T; update(): void };

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
                mutation(value);
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

let data = (await Endpoints.getConfig('BattleStrategy')) ?? { dsl: [], snm: [] };
export const BattleStrategy = await createLocalStorageProxy<{
    dsl: string[][];
    snm: string[][];
}>('BattleStrategy', data, Endpoints.setConfig.bind(null, 'BattleStrategy'));

data = (await Endpoints.getConfig('PetGroups')) ?? Array(6).fill((() => [])());
export const PetGroups = await createLocalStorageProxy<Array<number[]>>(
    'PetGroups',
    data,
    Endpoints.setConfig.bind(null, 'PetGroups')
);
