import { PetPosType, SEAPetStore } from '@sea/core';
import * as endpoints from '../../services/endpoints';

const JIM_ID = 3582;

export let store = new Map<string, number>();
const lookup = new Map<number, string>();

const petFilter = (v: { id: number; level: number; posi: PetPosType }) =>
    (v.id >= JIM_ID && v.level === 100) || v.posi === PetPosType.elite;

/**
 * 同步玩家的CT表
 * 取 (几米往后的近现代精灵 & 等级为100) | 精英收藏和背包中的精灵
 */
async function sync() {
    const data1 = Array.from((await SEAPetStore.miniInfo.get()).values());
    const data2 = (await SEAPetStore.bag.get()).flat();
    const mapping = (v: { name: string; catchTime: number; id: number; level: number }) => {
        add(v.name, v.catchTime);
    };
    data1.filter(petFilter).forEach(mapping);
    data2.forEach(mapping);

    await endpoints.updateAllCatchTime(store);
}

/**
 * 从本地配置中拉取CT表
 */
async function load() {
    store.clear();
    lookup.clear();
    store = await endpoints.queryCatchTime();
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
