import { PetPosition as PosType } from '../constant/index.js';
import { PetDataManger } from './PetDataManager.js';

type BagPetsPos = typeof PosType.bag1 | typeof PosType.secondBag1 | -1;
/**
 * @description 获取背包精灵列表
 */
export const getBagPets = async (location: BagPetsPos = -1) => {
    const arr = await PetDataManger.bag.get();
    switch (location) {
        case PosType.bag1:
            return arr[0];
        case PosType.secondBag1:
            return arr[1];
        default:
            return [];
    }
};

type StoragePetsPos = typeof PosType.storage | typeof PosType.elite;
/**
 * @description 获取仓库精灵列表
 * @return 获取精灵信息的异步函数
 */
export const getStoragePets = async (location: StoragePetsPos) => {
    const dict = await PetDataManger.miniInfo.get();
    return [...dict.values()].filter((p) => p.posi === location);
};

export function cureAllPet() {
    PetManager.noAlarmCureAll();
}

export function matchName(_name: string) {
    throw new Error('not implemented');
}

export { PetDataManger } from './PetDataManager.js';
export { PetLocation as PetLocation } from './PetLocation.js';
export { SEAPet } from './SEAPet.js';

