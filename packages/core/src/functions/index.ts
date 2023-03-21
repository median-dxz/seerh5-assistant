import * as Battle from '../battle';
import { Item, PetPosition } from '../constant';
import { buyPetItem, Socket } from '../engine';
import * as PetHelper from '../pet-helper';

import { delay } from '../common';
import { PetElement } from '../entity/PetElement';
import { defaultStyle, SaModuleLogger } from '../logger';
const log = SaModuleLogger('SAFunctions', defaultStyle.mod);

type PotionId = AttrConst<typeof Item.Potion>;
/**
 * @param {number[]} cts 要压血的精灵列表
 * @param {PotionId} healPotionId 血药id, 默认中级体力药
 * @description 利用谱尼封印自动压血
 */
export async function lowerBlood(cts: number[], healPotionId: PotionId = Item.Potion.中级体力药剂): Promise<void> {
    cts = cts.slice(0, 6);
    cts = cts.filter(PetManager.getPetInfo.bind(PetManager));
    if (!cts || cts.length === 0) {
        return;
    }

    // 检测列表是否全在背包
    let curPets = await PetHelper.getBagPets(PetPosition.bag1);

    for (let ct of cts) {
        if ((await PetHelper.getPetLocation(ct)) !== PetPosition.bag1) {
            if (PetManager.isBagFull) {
                let replacePet = curPets.find((p) => !cts.includes(p.catchTime))!;
                log(`压血 -> 将 ${replacePet.name} 放入仓库`);
                await PetHelper.popPetFromBag(replacePet.catchTime);
                curPets = await PetHelper.getBagPets(PetPosition.bag1);
            }
            await PetHelper.setPetLocation(ct, PetPosition.bag1);
        }
    }
    log(`压血 -> 背包处理完成`);

    const hpChecker = () => cts.filter((ct) => PetManager.getPetInfo(ct).hp >= 150);

    const usePotion = async (ct: number) => {
        if (PetManager.getPetInfo(ct).hp <= 50) {
            usePotionForPet(ct, healPotionId);
            await delay(50);
        }
        usePotionForPet(ct, Item.Potion.中级活力药剂);
    };

    await delay(300);
    if (hpChecker().length === 0) {
        cts.forEach(usePotion);
        return delay(720);
    }

    buyPetItem(Item.Potion.中级活力药剂, cts.length);
    buyPetItem(healPotionId, cts.length);
    PetHelper.setDefault(cts[0]);
    await delay(300);

    const { Manager, Operator, Provider } = Battle;

    Manager.strategy = async (battleState, skills, battlePets) => {
        if (battleState.round > 0 && battleState.self?.hp.remain! < 50) {
            let nextPet = battlePets.findIndex(
                (v) => cts.includes(v.catchTime) && v.hp > 200 && v.catchTime !== battleState.self!.catchtime
            );

            if (nextPet === -1) {
                Operator.escape();
                return;
            }
            await Operator.switchPet(nextPet);
            if (battleState.isDiedSwitch) {
                skills = Provider.getCurSkills()!;
                Operator.useSkill(skills.find((v) => v.category !== 4)!.id);
            }
        } else {
            Operator.useSkill(skills.find((v) => v.category !== 4)!.id);
        }
    };

    await Battle.Manager.runOnce(() => {
        FightManager.fightNoMapBoss(6730);
    });

    cts.forEach(usePotion);
    await delay(720);
    let leftCts = hpChecker();
    if (leftCts.length > 0) {
        return lowerBlood(leftCts, healPotionId);
    } else {
        Manager.strategy = undefined;
        return;
    }
}

/**
 * @description 对精灵使用药水
 */
export function usePotionForPet(catchTime: number, potionId: number) {
    return Socket.sendByQueue(CommandID.USE_PET_ITEM_OUT_OF_FIGHT, [catchTime, potionId]);
}

export async function switchBag(cts: number[]) {
    if (!cts || cts.length === 0) return;
    // 清空现有背包
    for (let v of await PetHelper.getBagPets(PetPosition.bag1)) {
        if (!cts.includes(v.catchTime)) {
            await PetHelper.popPetFromBag(v.catchTime);
            log(`SwitchBag -> 将 ${v.name} 放入仓库`);
        }
    }
    for (let v of cts) {
        await PetHelper.setPetLocation(v, PetPosition.bag1);
        log(`SwitchBag -> 将 ${PetManager.getPetInfo(v).name} 放入背包`);
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

    let r = pets.filter((v) => PetElement.formatById(PetXMLInfo.getType(v.id)).calcRatio(e) >= radio);
    return r.map((v) => {
        let eid = PetXMLInfo.getType(v.id);
        return {
            name: v.name,
            elementId: eid,
            element: SkillXMLInfo.typeMap[eid].cn,
            id: v.id,
            ratio: PetElement.formatById(eid).calcRatio(e),
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
                    await Socket.sendByQueue(CommandID.COUNTERMARK_RESOLVE, mark.obtainTime);
                    await delay(100);
                }
            }
        }
    }
}

const BattleFireValue = {
    类型: 2913,
    到期时间戳: 2914,
} as const;

export async function updateBattleFireInfo() {
    return Socket.multiValue(BattleFireValue.类型, BattleFireValue.到期时间戳).then((r) => {
        return {
            type: r[0],
            valid: r[1] > 0 && SystemTimerManager.time < r[1],
            timeLeft: r[1] - SystemTimerManager.time,
        };
    });
}

/**
 * @description 获取EgretObject,以stage作为root寻找所有符合断言的obj,不会查找stage本身
 */
export function findObject<T extends { new (...args: any[]): InstanceType<T> }>(
    instanceClass: T,
    predicate: (obj: egret.DisplayObject) => boolean
) {
    const root = LevelManager.stage;

    function find(parent: egret.DisplayObject) {
        if (parent.$children == null) {
            return [];
        }
        let result: InstanceType<T>[] = [];
        for (let child of parent.$children) {
            if (child instanceof instanceClass && predicate(child) === true) {
                result.push(child);
            }
            result = result.concat(find(child));
        }
        return result;
    }

    return find(root);
}

export function getClickTarget() {
    const listener = (e: egret.TouchEvent) => {
        log(e.target);
        LevelManager.stage.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, listener, null);
    };
    LevelManager.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, listener, null);
}

export function updateBatteryTime() {
    const leftTime =
        MainManager.actorInfo.timeLimit -
        (MainManager.actorInfo.timeToday + Math.floor(Date.now() / 1000 - MainManager.actorInfo.logintimeThisTime));
    BatteryController.Instance._leftTime = Math.max(0, leftTime);
}

export { HelperLoader } from './helper';

