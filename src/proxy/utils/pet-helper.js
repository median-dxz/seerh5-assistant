import { CalcElementRatio, SocketReceivedPromise } from './sa-utils.js';
import Const from '../const/_exports.js';

const PosType = Const.PETPOS;

/**
 * @description 获取精灵列表
 * @param {Number} location - Const.PETPOS
 */
function getPets(location) {
    let r = [];
    let dict;
    switch (location) {
        case PosType.bag1:
            dict = PetManager._bagMap._content;
            break;
        case PosType.secondBag1:
            dict = PetManager._secondBagMap._content;
            break;
        case PosType.storage:
            dict = PetStorage2015InfoManager.getInfoByPosi(0);
            break;
        case PosType.elite:
            dict = PetStorage2015InfoManager.getInfoByPosi(1);
            break;
    }

    for (let i in dict) {
        i = dict[i];
        r.push({ catchTime: i.catchTime, name: i.name, id: i.id });
    }
    return r;
}

const isDefault = (ct) => PetManager.defaultTime == ct;

const setDefault = (ct) => PetManager.setDefault(ct);

const getPetLocation = async (ct) => {
    return new Promise((resolve, reject) => {
        PetStorage2015InfoManager.getTotalInfo(() => {
            let r = PetStorage2015InfoManager.allInfo.find((v) => v.catchTime == ct);
            if (!r) {
                resolve(
                    PetManager._bagMap.containsKey(ct)
                        ? PosType.bag1
                        : PetManager._secondBagMap.containsKey(ct)
                        ? PosType.secondBag1
                        : -1
                );
            } else {
                resolve(r.posi);
            }
        });
    });
};

const setPetLocation = async (ct, newLocation) => {
    let l = await getPetLocation(ct);
    if (l == newLocation || l == -1) return false;
    switch (newLocation) {
        case PosType.secondBag1:
            if (PetManager.isSecondBagFull) return false;
            await SocketReceivedPromise(CommandID.PET_RELEASE, async () => {
                if (l == PosType.bag1) {
                    PetManager.bagToSecondBag(ct);
                } else if (l == PosType.storage) {
                    PetManager.storageToSecondBag(ct);
                } else if (l == PosType.elite) {
                    SocketReceivedPromise(CommandID.PET_RELEASE, () => {
                        PetManager.delLovePet(0, ct, 0);
                    });
                    PetManager.storageToSecondBag(ct);
                }
            });

            break;
        case PosType.bag1:
            if (PetManager.isBagFull) return false;
            await SocketReceivedPromise(CommandID.PET_RELEASE, async () => {
                if (l == PosType.secondBag1) {
                    PetManager.secondBagToBag(ct);
                } else if (l == PosType.storage) {
                    PetManager.storageToBag(ct);
                } else if (l == PosType.elite) {
                    PetManager.loveToBag(ct);
                }
            });

            break;
        case PosType.storage:
            await SocketReceivedPromise(CommandID.PET_RELEASE, async () => {
                if (l == PosType.bag1) {
                    PetManager.bagToStorage(ct);
                } else if (l == PosType.secondBag1) {
                    PetManager.secondBagToStorage(ct);
                } else if (l == PosType.elite) {
                    PetManager.delLovePet(0, ct, 0);
                }
            });
            break;
        case PosType.elite:
            await SocketReceivedPromise(CommandID.PET_RELEASE, async () => {
                if (l == PosType.bag1) {
                    PetManager.bagToStorage(ct);
                } else if (l == PosType.secondBag1) {
                    PetManager.secondBagToStorage(ct);
                }
            });
            await SocketReceivedPromise(CommandID.PET_RELEASE, async () => {
                PetManager.addLovePet(0, ct, 0);
            });
            break;
        default:
            break;
    }

    return new Promise((resolve, reject) => {
        PetStorage2015InfoManager.getTotalInfo(() => {
            resolve(true);
        });
    });
};

/**
 * @description 计算克制高倍克制(默认大于等于1.5)
 * @param {Number} e 属性1id
 * @param {Number} [radio=1.5] 倍率
 */
function calcAllEffecientPet(e, ratio = 1.5) {
    return new Promise((resolve, reject) => {
        PetStorage2015InfoManager.getTotalInfo(() => {
            let pets = [
                ...PetStorage2015InfoManager.allInfo,
                ...PetManager._bagMap.getValues(),
                ...PetManager._secondBagMap.getValues(),
            ];
            let r = pets.filter(
                (v) =>
                    CalcElementRatio(
                        Object.prototype.hasOwnProperty.call(v, 'type') ? v.type : PetXMLInfo.getType(v.id),
                        e
                    ) >= ratio
            );
            r = r.map((v) => {
                let eid = Object.prototype.hasOwnProperty.call(v, 'type') ? v.type : PetXMLInfo.getType(v.id);
                return {
                    name: v.name,
                    elementId: eid,
                    element: SkillXMLInfo.petTypeNameCN(eid),
                    id: v.id,
                    ratio: CalcElementRatio(eid, e),
                };
            });
            resolve(r);
        });
    });
}

export { isDefault, setDefault };
export { getPetLocation, setPetLocation };
export { getPets, calcAllEffecientPet };
