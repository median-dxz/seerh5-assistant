import type { PetPosType } from '../constant/index.js';
import { PetDataManger } from './PetDataManager.js';
import { PetLocation } from './PetLocation.js';

/**
 * @description 获取背包精灵列表
 */
export const getBagPets = async (location: PetLocation = PetLocation.Unknown) => {
    const arr = await PetDataManger.bag.get();
    switch (location) {
        case PetLocation.Bag:
            return arr[0];
        case PetLocation.SecondBag:
            return arr[1];
        default:
            return [];
    }
};

type StoragePetsPos = PetPosType.elite | PetPosType.storage;
/**
 * @description 获取仓库精灵列表
 * @return 获取精灵信息的异步函数
 */
export const getStoragePets = async (location: StoragePetsPos) => {
    const dict = await PetDataManger.miniInfo.get();
    return [...dict.values()].filter((p) => p.posi === (location as number));
};

export { PetDataManger } from './PetDataManager.js';
export { PetLocation } from './PetLocation.js';
export { SEAPet } from './SEAPet.js';

