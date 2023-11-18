import { extractObjectId } from '../common/utils.js';
import type { Item } from '../entity/index.js';
import { Pet } from '../entity/index.js';

import type { ProxyPet } from './PetDataManager.js';
import { PetDataManger as ins } from './PetDataManager.js';
import type { SEAPetLocation } from './PetLocation.js';

export type CatchTime = number;

const PetHandlerStatic = {
    async get(pet: CatchTime | Pet) {
        const ct = extractObjectId(pet, Pet.instanceKey);
        if (ins.cache.has(ct)) {
            return ins.cache.get(ct)!;
        } else {
            return ins.query(ct);
        }
    },
    async isDefault(pet: CatchTime | Pet) {
        const r = await this.get(pet);
        return r.isDefault;
    },
    async default(pet: CatchTime | Pet) {
        const r = await this.get(pet);
        return r.default();
    },
    async location(pet: CatchTime | Pet) {
        const r = await this.get(pet);
        return r.location();
    },
    async setLocation(pet: CatchTime | Pet, newLocation: SEAPetLocation) {
        const r = await this.get(pet);
        return r.setLocation(newLocation);
    },
    async popFromBag(pet: CatchTime | Pet) {
        const r = await this.get(pet);
        return r.popFromBag();
    },
    async cure(p: CatchTime | Pet) {
        const pet = await this.get(p);
        return pet.cure();
    },
    async useItem(pet: CatchTime | Pet, item: Item | number) {
        const r = await this.get(pet);
        return r.useItem(item);
    },
    async usePotion(pet: CatchTime | Pet, potion: Item | number) {
        const r = await this.get(pet);
        return r.usePotion(potion);
    },
};
type SEAPetHandler = typeof PetHandlerStatic & { (pet: CatchTime | Pet): ProxyPet };
const PetHandlerFunc = function () {
    // let object callable
} as unknown as SEAPetHandler;
Object.entries(PetHandlerStatic).forEach(([_p, _f]) => {
    (PetHandlerFunc as any)[_p] = _f; // eslint-disable-line
});

export const SEAPet: SEAPetHandler = new Proxy(PetHandlerFunc, {
    apply: (target, thisArg, argArray: [CatchTime | Pet]) => {
        const ct = extractObjectId(argArray[0], Pet.instanceKey);
        return ins.cache.get(ct);
    },
});