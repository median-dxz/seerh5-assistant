import * as Battle from '../battle';
import { PetPosition, Potion } from '../constant';
import { buyPetItem, Socket } from '../engine';
import { SAPet, SAPetLocation } from '../pet-helper';

import { delay } from '../common';
import { PetElement } from '../entity/PetElement';
import { defaultStyle, SaModuleLogger } from '../logger';
import { getBagPets, PetDataManger } from '../pet-helper';
const log = SaModuleLogger('SAFunctions', defaultStyle.mod);

type PotionId = AttrConst<typeof Potion>;
/**
 * @param {number[]} cts 要压血的精灵列表
 * @param {PotionId} healPotionId 血药id, 默认中级体力药
 * @description 利用谱尼封印自动压血
 */
export async function lowerBlood(cts: number[], healPotionId: PotionId = Potion.中级体力药剂): Promise<void> {
    cts = cts.slice(0, 6);
    if (!cts || cts.length === 0) {
        return;
    }

    // 检测列表是否全在背包
    let curPets = await getBagPets(PetPosition.bag1);
    let replacePets = curPets.filter((p) => !cts.includes(p.catchTime));

    for (let ct of cts) {
        const location = await SAPet(ct).location();
        if (location !== SAPetLocation.Bag && location !== SAPetLocation.Default) {
            if (PetManager.isBagFull) {
                let replacePet = replacePets.pop()!;
                log(`压血 -> 将 ${replacePet.name} 放入仓库`);
                await SAPet(replacePet.catchTime).popFromBag();
            }
            await SAPet(ct).setLocation(SAPetLocation.Bag);
        }
    }
    log(`压血 -> 背包处理完成`);
    await getBagPets();

    const hpChecker = () => cts.filter((ct) => SAPet(ct).hp >= 150);

    const usePotion = async (ct: number) => {
        if (SAPet(ct).hp <= 50) {
            await SAPet(ct).usePotion(healPotionId);
        }
        await SAPet(ct).usePotion(Potion.中级活力药剂);
    };

    if (hpChecker().length === 0) {
        for (const ct of cts) {
            await usePotion(ct);
        }
        await getBagPets();
        return;
    }

    buyPetItem(Potion.中级活力药剂, cts.length);
    buyPetItem(healPotionId, cts.length);
    await SAPet(cts[0]).default();
    await delay(500);

    const { Manager, Operator, Provider } = Battle;

    const strategy: Battle.MoveModule = async (battleState, skills, battlePets) => {
        if (battleState.round > 0 && battleState.self?.hp.remain! < 50) {
            let nextPet = battlePets.findIndex(
                (v) => cts.includes(v.catchTime) && v.hp > 200 && v.catchTime !== battleState.self!.catchtime
            );
            log(nextPet, battlePets);
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
    }, strategy);

    for (const ct of cts) {
        await usePotion(ct);
    }

    await delay(500);
    let leftCts = hpChecker();
    if (leftCts.length > 0) {
        return lowerBlood(leftCts, healPotionId);
    } else {
        await getBagPets();
        Manager.clear();
        return;
    }
}

export async function switchBag(cts: number[]) {
    // 清空现有背包
    for (const v of await getBagPets(PetPosition.bag1)) {
        if (!cts.includes(v.catchTime)) {
            await SAPet(v).popFromBag();
            log(`SwitchBag -> 将 ${v.name} 放入仓库`);
        }
    }
    for (let v of cts) {
        await SAPet(v).setLocation(SAPetLocation.Bag);
        log(`SwitchBag -> 将 ${SAPet(v).name} 放入背包`);
    }
}

/**
 * @description 计算可用的高倍克制精灵(默认大于等于1.5)
 */
export async function calcAllEfficientPet(e: number, radio: number = 1.5) {
    const [bag1, bag2] = await PetDataManger.bag.get();
    const mini = (await PetDataManger.miniInfo.get()).values();
    let pets = [...bag1, ...bag2, ...mini];

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

export function updateBatteryTime() {
    const leftTime =
        MainManager.actorInfo.timeLimit -
        (MainManager.actorInfo.timeToday + Math.floor(Date.now() / 1000 - MainManager.actorInfo.logintimeThisTime));
    BatteryController.Instance._leftTime = Math.max(0, leftTime);
}

export { HelperLoader } from './helper';

