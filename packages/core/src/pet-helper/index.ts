import { PetPosition as PosType } from '../constant';
import { GetBitSet, SocketReceivedPromise, SocketSendByQueue } from '../engine';
import Pet from '../entity/Pet';

type PosType = AttrConst<typeof PosType>;

/**
 * @description 更新精灵数据
 */
export const updateStorageInfo = async () => {
    return new Promise<void>((resolve, reject) => {
        PetManager.getLovePetList();
        PetManager.updateBagInfo(resolve);
    }).then(
        () =>
            new Promise<void>((resolve, reject) => {
                PetStorage2015InfoManager.getTotalInfo(resolve);
            })
    );
};

type BagPetsPos = typeof PosType.bag1 | typeof PosType.secondBag1;
/**
 * @description 获取背包精灵列表
 */
export const getBagPets = async (location: BagPetsPos) => {
    await updateStorageInfo();
    let dict: Array<PetInfo>;
    switch (location) {
        case PosType.bag1:
            dict = PetManager._bagMap.getValues();
            break;
        case PosType.secondBag1:
            dict = PetManager._secondBagMap.getValues();
            break;
        default:
            dict = [];
    }

    return dict.map((v) => new Pet(v));
};

type StoragePetsPos = typeof PosType.storage | typeof PosType.elite;
/**
 * @description 获取仓库精灵列表
 * @return 获取精灵信息的异步函数
 */
export const getStoragePets = async (location: StoragePetsPos) => {
    await updateStorageInfo();
    let dict: Array<PetStorage2015PetInfo>;
    switch (location) {
        case PosType.storage:
            dict = PetStorage2015InfoManager.getInfoByType(0, 0);
            break;
        case PosType.elite:
            dict = PetStorage2015InfoManager.getInfoByType(1, 0);
            break;
        default:
            dict = [];
    }

    return dict.map((v) => () => PetFactory.formatByCatchtimeAsync(v.catchTime));
};

export const isDefault = (ct: number) => PetManager.defaultTime === ct;
export const setDefault = (ct: number) => PetManager.setDefault(ct);

export const getPetLocation = async (ct: number) => {
    await updateStorageInfo();
    const r = PetStorage2015InfoManager.allInfo.find((v) => v.catchTime === ct);
    if (!r) {
        if (PetManager._bagMap.containsKey(ct)) {
            return PosType.bag1;
        } else if (PetManager._secondBagMap.containsKey(ct)) {
            return PosType.secondBag1;
        } else {
            return -1;
        }
    } else {
        return r.posi;
    }
};

export const setPetLocation = async (ct: number, newLocation: PosType) => {
    if (!ct) return false;
    let l = await getPetLocation(ct);
    if (l === newLocation || l === -1) return false;
    switch (newLocation) {
        case PosType.secondBag1:
            if (PetManager.isSecondBagFull) return false;
            await SocketReceivedPromise(CommandID.PET_RELEASE, () => {
                if (l === PosType.bag1) {
                    PetManager.bagToSecondBag(ct);
                } else if (l === PosType.storage || l === PosType.elite) {
                    PetManager.storageToSecondBag(ct);
                }
            });
            break;
        case PosType.bag1:
            if (PetManager.isBagFull) return false;
            await SocketReceivedPromise(CommandID.PET_RELEASE, () => {
                if (l === PosType.secondBag1) {
                    PetManager.secondBagToBag(ct);
                } else if (l === PosType.storage) {
                    PetManager.storageToBag(ct);
                } else if (l === PosType.elite) {
                    PetManager.loveToBag(ct);
                }
            });
            break;
        case PosType.storage:
            if (l === PosType.elite) {
                await SocketReceivedPromise(CommandID.DEL_LOVE_PET, () => PetManager.delLovePet(0, ct, 0));
                break;
            }
            await SocketReceivedPromise(CommandID.PET_RELEASE, () => {
                if (l === PosType.bag1) {
                    PetManager.bagToStorage(ct);
                } else if (l === PosType.secondBag1) {
                    PetManager.secondBagToStorage(ct);
                }
            });
            break;
        case PosType.elite:
            if (l !== PosType.storage) {
                await SocketReceivedPromise(CommandID.PET_RELEASE, () => {
                    if (l === PosType.bag1) {
                        PetManager.bagToStorage(ct);
                    } else if (l === PosType.secondBag1) {
                        PetManager.secondBagToStorage(ct);
                    }
                });
            }
            if ((await getPetLocation(ct)) === PosType.storage) {
                await SocketReceivedPromise(CommandID.ADD_LOVE_PET, () => PetManager.addLovePet(0, ct, 0));
                PetStorage2015InfoManager.changePetPosi(ct, PosType.elite);
            }
            break;
        default:
            break;
    }

    return updateStorageInfo().then((v) => true);
};

export const popPetFromBag = async (ct: number) => {
    const local = await getPetLocation(ct);
    if (local !== PosType.elite && local !== PosType.storage) {
        await setPetLocation(ct, PosType.storage);
    }
};

export function cureOnePet(ct: number) {
    SocketSendByQueue(CommandID.PET_ONE_CURE, ct);
}

export function cureAllPet() {
    PetManager.noAlarmCureAll();
}

export function toggleAutoCure(enable: boolean) {
    SocketSendByQueue(42019, [22439, Number(enable)]);
}

export async function getAutoCureState(): Promise<boolean> {
    const r = await GetBitSet(22439);
    return r[0];
}

export async function formatPetByCatchtime(ct: number) {
    return new Pet(PetManager.getPetInfo(ct));
}

export async function formatPetByCatchtimeAsync(ct: number) {
    const petInfo: PetInfo = await PetManager.UpdateBagPetInfoAsynce(ct);
    return new Pet(petInfo);
}
