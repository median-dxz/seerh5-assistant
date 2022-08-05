import { CalcElementRatio } from './sa-utils.js';

/**
 * @description 获取精灵列表
 * @param {PetStorage2015PosiType} location
 */
function getPets(location) {
    let r = [];
    let dict;
    switch (location) {
        case PetStorage2015PosiType.BAG1:
            dict = PetManager._bagMap._content;
            break;
        case PetStorage2015PosiType.BAG2:
            dict = PetManager._secondBagMap._content;
            break;
        case PetStorage2015PosiType.STORAGE:
            dict = PetStorage2015InfoManager.getInfoByPosi(0);
            break;
        case PetStorage2015PosiType.ELITE:
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
    const posType = PetStorage2015PosiType;
    return new Promise((resolve, reject) => {
        PetStorage2015InfoManager.getTotalInfo(() => {
            let r = PetStorage2015InfoManager.allInfo.find((v) => v.catchTime == ct);
            if (!r) {
                resolve(
                    PetManager._bagMap.containsKey(ct)
                        ? posType.BAG1
                        : PetManager._secondBagMap.containsKey(ct)
                        ? posType.BAG2
                        : -1
                );
            } else {
                resolve(r.posi);
            }
        });
    });
};

const setPetLocation = async (ct, newLocation) => {
    const posType = PetStorage2015PosiType;
    let l = await getPetLocation(ct);
    switch (newLocation) {
        case posType.BAG2:
            if (PetManager.isSecondBagFull) return false;
            if (l == posType.BAG1) {
                await PetManager.bagToSecondBag(ct);
            } else if (l == posType.STORAGE) {
                await PetManager.storageToSecondBag(ct);
            } else if (l == posType.ELITE) {
                await PetManager.delLovePet(0, ct, 0);
                await PetManager.storageToSecondBag(ct);
            }

            break;
        case posType.BAG1:
            if (PetManager.isBagFull) return false;
            if (l == posType.BAG2) {
                await PetManager.secondBagToBag(ct);
            } else if (l == posType.STORAGE) {
                await PetManager.storageToBag(ct);
            } else if (l == posType.ELITE) {
                await PetManager.loveToBag(ct);
            }

            break;
        case posType.STORAGE:
            if (l == posType.BAG1) {
                await PetManager.bagToStorage(ct);
            } else if (l == posType.BAG2) {
                await PetManager.secondBagToStorage(ct);
            } else if (l == posType.ELITE) {
                await PetManager.delLovePet(0, ct, 0);
            }

            break;
        case posType.ELITE:
            if (l == posType.BAG1) {
                await PetManager.bagToStorage(ct);
            } else if (l == posType.BAG2) {
                await PetManager.secondBagToStorage(ct);
            }
            await PetManager.addLovePet(0, ct, 0);
            break;
        default:
            break;
    }
    return await PetStorage2015InfoManager.getTotalInfo(() => {});
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
