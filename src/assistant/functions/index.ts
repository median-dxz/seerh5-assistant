import * as BattleModule from '../battle-module';
import { CMDID, ITEMS, PETPOS } from '../const';
import * as PetHelper from '../pet-helper';
import { BuyPetItem, SocketSendByQueue } from '../utils';

import { delay } from '../common';
import { defaultStyle, SaModuleLogger } from '../logger';
const log = SaModuleLogger('SAFunctions', defaultStyle.mod);

type PotionId = AttrConst<typeof ITEMS.Potion>;
/**
 * @param {number[]} cts 要压血的精灵列表
 * @param {PotionId} healPotionId 血药id, 默认中级体力药
 * @description 利用谱尼封印自动压血
 */
export async function lowerBlood(cts: number[], healPotionId: PotionId = ITEMS.Potion.中级体力药剂): Promise<void> {
    cts = cts.slice(0, 6);
    if (!cts || cts.length === 0) {
        return;
    }

    // 检测列表是否全在背包
    let curPets = await PetHelper.getBagPets(PETPOS.bag1);

    for (let ct of cts) {
        if ((await PetHelper.getPetLocation(ct)) !== PETPOS.bag1) {
            if (PetManager.isBagFull) {
                let replacePet = curPets.find((p) => !cts.includes(p.catchTime))!;
                log(`压血 -> 将 ${replacePet.name} 放入仓库`);
                await PetHelper.setPetLocation(replacePet.catchTime, PETPOS.storage);
                curPets = await PetHelper.getBagPets(PETPOS.bag1);
            }
            await PetHelper.setPetLocation(ct, PETPOS.bag1);
        }
    }
    log(`压血 -> 背包处理完成`);

    const hpChecker = () => cts.filter((ct) => PetManager.getPetInfo(ct).hp >= 200);

    const usePotion = (ct: number) => {
        if (PetManager.getPetInfo(ct).hp <= 50) {
            usePotionForPet(ct, healPotionId);
        }
        usePotionForPet(ct, ITEMS.Potion.中级活力药剂);
    };

    await delay(300);
    if (hpChecker().length === 0) {
        cts.forEach(usePotion);
        return;
    }

    BuyPetItem(ITEMS.Potion.中级活力药剂, cts.length);
    BuyPetItem(healPotionId, cts.length);
    PetHelper.setDefault(cts[0]);
    await delay(300);

    const { Manager, Operator, InfoProvider } = BattleModule;

    Manager.strategy.custom = async (battleStatus, skills, battlePets) => {
        if (battleStatus.round > 0 && battleStatus.self?.hp.remain! < 50) {
            let nextPet = battlePets.findIndex(
                (v) => cts.includes(v.catchTime) && v.hp > 200 && v.catchTime !== battleStatus.self!.catchtime
            );

            if (nextPet === -1) {
                Operator.escape();
                return;
            }
            await Operator.switchPet(nextPet);
            if (battleStatus.isDiedSwitch) {
                skills = InfoProvider.getCurSkills()!;
                Operator.useSkill(skills.find((v) => v.category !== 4)!.id);
            }
        } else {
            Operator.useSkill(skills.find((v) => v.category !== 4)!.id);
        }
    };

    return BattleModule.Manager.runOnce(() => {
        FightManager.fightNoMapBoss(6730);
    }).then(() => {
        cts.forEach(usePotion);
        let leftCts = hpChecker();
        if (leftCts.length > 0) {
            return lowerBlood(leftCts, healPotionId);
        } else {
            Manager.strategy.custom = undefined;
        }
    });
}

/**
 * @description 对精灵使用药水
 */
export function usePotionForPet(catchTime: number, potionId: number) {
    return SocketSendByQueue(CMDID.USE_PET_ITEM_OUT_OF_FIGHT, [catchTime, potionId]);
}

export async function switchBag(pets: Pick<SAType.PetLike, 'catchTime' | 'name'>[]) {
    // 清空现有背包
    for (let v of await PetHelper.getBagPets(PETPOS.bag1)) {
        await PetHelper.setPetLocation(v.catchTime, PETPOS.storage);
        log(`SwitchBag -> 将 ${v.name} 放入仓库`);
    }
    for (let v of pets) {
        await PetHelper.setPetLocation(v.catchTime, PETPOS.bag1);
        log(`SwitchBag -> 将 ${v.name} 放入背包`);
    }
}

/**
 * @description 计算可用的高倍克制精灵(默认大于等于1.5)
 */
export async function calcAllEfficientPet(e: number, radio: number = 1.5) {
    await PetHelper.updateStorageInfo();
    let pets = [
        ...PetStorage2015InfoManager.allInfo,
        ...PetManager._bagMap.getValues(),
        ...PetManager._secondBagMap.getValues(),
    ];
    let r = pets.filter((v) => PetHelper.calcElementRatio(PetXMLInfo.getType(v.id), e) >= radio);
    return r.map((v) => {
        let eid = PetXMLInfo.getType(v.id);
        return {
            name: v.name,
            elementId: eid,
            element: SkillXMLInfo.typeMap[eid].cn,
            id: v.id,
            ratio: PetHelper.calcElementRatio(eid, e),
        };
    });
}

export async function delCounterMark() {
    const universalMarks = CountermarkController.getAllUniversalMark().reduce((pre, v) => {
        const name = v.markName;
        if (v.catchTime === 0 && v.isBindMon === false && v.level < 5) {
            if (pre.has(name)) {
                pre.get(name)!.push(v);
            } else {
                pre.set(v.markName, [v]);
            }
        }
        return pre;
    }, new Map<string, CountermarkInfo[]>());

    for (let [k, v] of universalMarks) {
        if (v.length > 5) {
            for (let i in v) {
                if (parseInt(i) >= 14) {
                    const mark = v[i];
                    await SocketSendByQueue(CMDID.COUNTERMARK_RESOLVE, mark.obtainTime);
                    await delay(100);
                }
            }
        }
    }
}
