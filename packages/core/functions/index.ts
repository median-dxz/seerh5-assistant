import * as Battle from '../battle/index.js';
import { SaModuleLogger, defaultStyle, delay } from '../common/utils.js';
import { PetPosition, Potion } from '../constant/index.js';
import { Socket, buyPetItem, toggleAutoCure } from '../engine/index.js';
import { PetElement } from '../entity/index.js';
import { PetDataManger, SAPet, SAPetLocation, getBagPets } from '../pet-helper/index.js';
const log = SaModuleLogger('SAFunctions', defaultStyle.mod);

type PotionId = (typeof Potion)[keyof typeof Potion];
/**
 * @param {number[]} cts 要压血的精灵列表
 * @param {PotionId} healPotionId 血药id, 默认中级体力药
 * @param {number} hpLimit 血量上限, 默认200, 压血后全部精灵血量低于该值
 * @description 利用谱尼封印自动压血
 */
export async function lowerBlood(
    cts: number[],
    healPotionId: PotionId = Potion.中级体力药剂,
    hpLimit: number = 200
): Promise<void> {
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

    const hpChecker = () => cts.filter((ct) => SAPet(ct).hp >= hpLimit);

    const usePotion = async (ct: number) => {
        if (SAPet(ct).hp == 0) {
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
    await toggleAutoCure(false);
    await delay(300);

    const { Manager, Operator } = Battle;

    const strategy: Battle.MoveModule = {
        resolveMove(battleState, skills, battlePets) {
            log('move', battleState.round, battleState.self?.hp.remain);
            if (battleState.self?.hp.remain! < hpLimit || !cts.includes(battleState.self?.catchtime!)) {
                let nextPet = this.resolveNoBlood(battleState, skills, battlePets) ?? -1;
                if (nextPet === -1) {
                    return Operator.escape();
                }
                return Operator.switchPet(nextPet);
            } else {
                return Operator.useSkill(skills.find((v) => v.category !== 4)!.id);
            }
        },
        resolveNoBlood: (battleState, skills, battlePets) => {
            return battlePets.findIndex(
                (v) => cts.includes(v.catchTime) && v.hp >= hpLimit && v.catchTime !== battleState.self!.catchtime
            );
        },
    };

    await Battle.Manager.runOnce(() => {
        FightManager.fightNoMapBoss(6730);
    }, strategy);

    await delay(300);

    for (const ct of cts) {
        await usePotion(ct);
    }

    await delay(300);
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
        const { name } = await SAPet(v).pet;
        await SAPet(v).setLocation(SAPetLocation.Bag);
        log(`SwitchBag -> 将 ${name} 放入背包`);
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

export { HelperLoader } from './helper.js';

