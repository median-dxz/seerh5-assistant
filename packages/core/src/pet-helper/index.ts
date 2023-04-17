import { PetPosition as PosType } from '../constant';
import { PetDataManger, ProxyPet } from './ProxyPet';

type BagPetsPos = typeof PosType.bag1 | typeof PosType.secondBag1 | -1;
/**
 * @description 获取背包精灵列表
 */
export const getBagPets = async (location: BagPetsPos = -1) => {
    let arr: Array<ProxyPet>;
    switch (location) {
        case PosType.bag1:
            arr = (await PetDataManger.bag.get())[0];
            break;
        case PosType.secondBag1:
            arr = (await PetDataManger.bag.get())[1];
            break;
        default:
            arr = [];
    }

    return arr;
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

export { SAPetLocation } from './PetLocation';
export { PetDataManger, SAPet } from './ProxyPet';

