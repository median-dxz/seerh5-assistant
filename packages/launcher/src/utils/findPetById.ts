import { PetDataManger, SEAPet, type Pet } from 'sea-core';

export async function findPetById(id: number): Promise<Pet | null> {
    const data1 = (await PetDataManger.bag.get()).flat();
    const data2 = Array.from(await PetDataManger.miniInfo.get()).map(([_, pet]) => pet);
    const r = [...data1, ...data2].find((pet) => pet.id === id);
    if (r) {
        return SEAPet.get(r.catchTime);
    } else {
        return null;
    }
}
