import { PetDataManger } from 'sea-core';
import * as Endpoints from '../service/endpoints';

export let CatchTimeStore = new Map<string, number>();

export const ct = async (...pets: string[]) => {
    const r = pets.map((r) => CatchTimeStore.get(r) ?? 0);
    if (!r.every(Boolean)) {
        r.map(async (r, index) => {
            if (r === 0) {
                const res = await Endpoints.queryCatchTime(pets[index]);
                r = res[0][1];
                if (!r) {
                    await loadAllCtFromGame();
                    Endpoints.cacheCatchTime(CatchTimeStore);
                    r = CatchTimeStore.get(pets[index])!;
                }
            }
            return r;
        });
    }
    return r;
};

export const loadAllCt = async () => {
    const data = await Endpoints.queryCatchTime();
    CatchTimeStore.clear();
    CatchTimeStore = new Map(data);
};

const loadAllCtFromGame = async () => {
    const data1 = await PetDataManger.miniInfo.get();
    const data2 = await PetDataManger.bag.get();
    const mapping = (v: { name: string; catchTime: number; id: number; level: number }) => {
        CatchTimeStore.set(v.name, v.catchTime);
    };
    data1.forEach(mapping);
    data2[0].forEach(mapping);
    data2[1].forEach(mapping);
};
