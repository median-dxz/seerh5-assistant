import consts from './const/_exports.js';
import { BattleInfoProvider, BattleModuleManager, BattleOperator } from './battle/battlemodule.js';
import { delay } from './utils/common.js';
import { getPetLocation, getPets, setDefault, setPetLocation } from './utils/pet-helper.js';
import { SocketSendByQueue } from './utils/sa-utils.js';

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

/**
 * @param {boolean} enable
 */
export function ToggleAutoCure(enable) {
    SocketSendByQueue(42019, [22439, Number(enable)]);
}

export async function SwitchBag(pets) {
    const PosType = consts.PETPOS;
    // 清空现有背包
    let olds = getPets(PosType.bag1);
    for (let v of olds) {
        await setPetLocation(v.catchTime, PosType.storage);
        console.log(`[PetHelper]: 将 ${v.name} 放入仓库`);
    }
    for (let v of pets) {
        await setPetLocation(v.catchTime, PosType.bag1);
        console.log(`[PetHelper]: 将 ${v.name} 放入背包`);
    }
}

/**
 * @param {!Array} pets 要压血的精灵列表
 * @param {Number} [healPotionId=300012] - 血药id{300011->300014}
 * @param {Function} cb 回调函数
 * @description 利用谱尼封印自动压血
 */
export async function LowerBlood(pets, healPotionId = 300013, cb) {
    const PosType = consts.PETPOS;
    if (!pets || pets.length === 0) {
        cb && cb();
        return;
    }

    // 检测列表是否全在背包
    const curPets = getPets(PosType.bag1);
    let p = 0;
    for (let pet of pets) {
        if ((await getPetLocation(pet)) != PosType.bag1) {
            if (PetManager.isBagFull) {
                while (pets.includes(curPets[p].catchTime)) {
                    p++;
                }
                console.log(`[SAHelper]: 压血 -> 将 ${curPets[p].name} 放入仓库`);
                await setPetLocation(curPets[p++].catchTime, PosType.storage);
            }
            await setPetLocation(pet, PosType.bag1);
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
            if (battleStatus.round > 0 && battleStatus.pet.hp < 50) {
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
            await delay(100);
            let notLowerPets = [];
            for (let pet of pets) {
                if (PetManager.getPetInfo(pet).hp <= 50) {
                    UsePotionForPet(pet, healPotionId);
                    await delay(100);
                } else if (PetManager.getPetInfo(pet).hp > 200) {
                    notLowerPets.push(pet);
                }
                UsePotionForPet(pet, consts.ITEMS.Potion.中级活力药剂 - 1);
                await delay(100);
            }
            if (notLowerPets.length > 0) {
                LowerBlood(notLowerPets, undefined, cb);
            } else {
                cb && cb();
            }
        }
    );
    BattleModuleManager.runOnce();
}

export async function delCounterMark() {
    const umarks = CountermarkController.getAllUniversalMark().reduce((pre, v) => {
        const name = v.markName;
        if (v.catchTime == 0 && v.isBindMon == false && v.level < 5) {
            if (!pre.has(name)) {
                pre.set(v.markName, [v]);
            } else {
                pre.get(name).push(v);
            }
        }
        return pre;
    }, new Map());

    let obj = Object.create(null);
    for (let [k, v] of umarks) {
        if (v.length > 5) {
            for (let i in v) {
                if (i >= 14) {
                    const mark = v[i];
                    const result = await SocketSendByQueue(CommandID.COUNTERMARK_RESOLVE, [mark.obtainTime]);
                    await delay(100);
                }
            }
        }
    }
}
