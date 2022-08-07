import consts from './const/_exports.js';
import { BattleInfoProvider, BattleModuleManager, BattleOperator } from './battle/battlemodule.js';
import { delay } from './utils/common.js';
import { getPetLocation, getPets, setDefault, setPetLocation } from './utils/pet-helper.js';
import { SocketSendByQueue } from './utils/sa-utils.js';
import { SAEventManager } from './eventhandler.js';

/**
 * @description 对精灵使用药水
 * @param {Number} catchTime 精灵ct
 * @param {Number} potionId 药水id
 */
export function UsePotionForPet(catchTime, potionId) {
    SocketSendByQueue(consts.CMDID.USE_PET_ITEM_OUT_OF_FIGHT, [catchTime, potionId]);
}

/**
 * @description 购买药水
 * @param {Number} potionId 药水id
 * @param {Number} amount  数量
 */
export function BuyPotion(potionId, amount) {
    SocketSendByQueue(consts.CMDID.ITEM_BUY, [potionId, amount]);
}

export function CurePet(ct) {
    SocketSendByQueue(consts.CMDID.PET_ONE_CURE, ct);
}

export function CureAllPet() {
    PetManager.noAlarmCureAll();
}

export async function switchBag(pets) {
    const PosType = PetStorage2015PosiType;
    // 清空现有背包
    let olds = getPets(PosType.BAG1);
    for (let v of olds) {
        await setPetLocation(v.catchTime, PosType.STORAGE);
        console.log(`[PetHelper]: 将 ${v.name} 放入仓库`);
        await delay(600);
    }
    for (let v of pets) {
        await setPetLocation(v.catchTime, PosType.BAG1);
        console.log(`[PetHelper]: 将 ${v.name} 放入背包`);
        await delay(600);
    }
}

/**
 * @param {!Array} pets 要压血的精灵列表
 * @param {Number} [healPotionId=300012] - 血药id{300011->300014}
 * @param {Function} cb 回调函数
 * @description 利用谱尼封印自动压血
 */
export async function LowerBlood(pets, healPotionId = 300013, cb) {
    if (!pets || pets.length === 0) {
        return;
    }

    // 检测列表是否全在背包
    const curPets = getPets(PetStorage2015PosiType.BAG1);
    let p = 0;
    for (let pet of pets) {
        if ((await getPetLocation(pet)) != PetStorage2015PosiType.BAG1) {
            if (PetManager.isBagFull) {
                while (pets.includes(curPets[p].catchTime)) {
                    p++;
                }
                console.log(`[SAHelper]: 压血 -> 将 ${curPets[p].name} 放入仓库`);
                await setPetLocation(curPets[p++].catchTime, PetStorage2015PosiType.STORAGE);
                await delay(800);
            }
            await setPetLocation(pet, PetStorage2015PosiType.BAG1);
            await delay(800);
        }
    }
    console.log(`[SAHelper]: 压血 -> 背包处理完成`);
    setDefault(pets[0]);
    await delay(800);

    BattleModuleManager.queuedModule(
        () => {
            FightManager.fightNoMapBoss(6730);
        },
        async (battleStatus, skills, battlePets) => {
            if (battleStatus.round > 0 && battleStatus.pet.hp < 200) {
                let nextPet = -1;
                for (let v of battlePets) {
                    if (pets.includes(v.catchTime) && v.hp > 200 && v.catchTime != battleStatus.pet.ct) {
                        nextPet = v.index;
                        break;
                    }
                }
                console.log(nextPet);
                if (nextPet == -1) {
                    BattleOperator.escape();
                    return;
                }
                BattleOperator.switchPet(nextPet);
                if (battleStatus.isDiedSwitch) {
                    await delay(400);
                    skills = BattleInfoProvider.getCurSkills();
                    BattleOperator.useSkill(skills.find((v) => v.category != 4).id);
                }
            } else {
                await delay(400);
                BattleOperator.useSkill(skills.find((v) => v.category != 4).id);
            }
        },
        async () => {
            for (let pet of pets) {
                if (PetManager.getPetInfo(pet).hp < 200) {
                    UsePotionForPet(pet, healPotionId);
                    await delay(50);
                }
                UsePotionForPet(pet, consts.ITEMS.Potion.中级活力药剂 - 1);
                await delay(50);
            }
            cb && cb();
        }
    );
    BattleModuleManager.runOnce();
}
