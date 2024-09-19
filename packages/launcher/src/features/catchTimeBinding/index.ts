import { trpcClient } from '@/services/shared';
import { PetPosType, SEAPetStore } from '@sea/core';

const MIN_ID = 2500;

export let store = new Map<string, number>();
const lookup = new Map<number, string>();

const petFilter = (v: { id: number; level: number; posi: PetPosType }) =>
    (v.id >= MIN_ID && v.level === 100) || v.posi === PetPosType.elite;

/**
 * 同步玩家的CT表
 * 取 (近现代精灵 & 等级为100) | 精英收藏和背包中的精灵
 */
async function sync() {
    const data1 = Array.from((await SEAPetStore.miniInfo.get()).values());
    const data2 = (await SEAPetStore.bag.get()).flat();
    const mapping = (v: { name: string; catchTime: number; id: number; level: number }) => {
        add(v.name, v.catchTime);
    };
    data1.filter(petFilter).forEach(mapping);
    data2.forEach(mapping);

    await updateAllCatchTime(store);
}

/**
 * 从本地配置中拉取CT表
 */
async function load() {
    store.clear();
    lookup.clear();
    store = await queryCatchTime();
    store.forEach((value, key) => lookup.set(value, key));
}

function remove(nameBinding: string) {
    const ct = store.get(nameBinding);
    if (ct) {
        store.delete(nameBinding);
        lookup.delete(ct);
    }
}

function add(name: string, ct: number) {
    if (!store.has(name)) {
        store.set(name, ct);
        lookup.set(ct, name);
    } else if (store.get(name) !== ct) {
        let i = 1;
        while (store.has(`${name}_${i}`)) {
            i++;
        }
        name = `${name}_${i}`;
        store.set(name, ct);
        lookup.set(ct, name);
    }
}

function ctByName(name: string) {
    return store.get(name);
}

function nameBindingByCt(ct: number) {
    return lookup.get(ct);
}

export { add, ctByName, load, nameBindingByCt, remove, sync };
const { launcherRouter: configRouter } = trpcClient;

export async function queryCatchTime(name: string): Promise<[string, number]>;
export async function queryCatchTime(): Promise<Map<string, number>>;
export async function queryCatchTime(name?: string) {
    return configRouter.catchTime.all.query(name);
}
export const updateAllCatchTime = async (data: Map<string, number>) => configRouter.catchTime.mutate.mutate(data);

export const deleteCatchTime = async (name: string) => configRouter.catchTime.delete.mutate(name);

export const addCatchTime = async (name: string, time: number) => configRouter.catchTime.set.mutate([name, time]);
