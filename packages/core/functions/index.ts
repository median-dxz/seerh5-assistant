import * as Battle from '../battle/index.js';
import { delay } from '../common/utils.js';
import { PetPosition, Potion } from '../constant/index.js';
import { Socket, buyPetItem, toggleAutoCure } from '../engine/index.js';
import { PetElement } from '../entity/index.js';
import { PetDataManger, SAPet, SAPetLocation, getBagPets } from '../pet-helper/index.js';

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
    hpLimit = 200
): Promise<void> {
    cts = cts.slice(0, 6);
    if (!cts || cts.length === 0) {
        return;
    }

    // 检测列表是否全在背包
    const curPets = await getBagPets(PetPosition.bag1);
    const replacePets = curPets.filter((p) => !cts.includes(p.catchTime));

    for (const ct of cts) {
        const location = await SAPet.location(ct);
        if (location !== SAPetLocation.Bag && location !== SAPetLocation.Default) {
            if (PetManager.isBagFull) {
                const replacePet = replacePets.pop()!;
                await replacePet.popFromBag();
            }
            await SAPet.setLocation(ct, SAPetLocation.Bag);
        }
    }
    await getBagPets();

    const hpChecker = () => cts.filter((ct) => SAPet(ct).hp >= hpLimit);

    const usePotion = async (ct: number) => {
        let pet = await SAPet.get(ct);
        if (pet.hp == 0) {
            pet = await pet.usePotion(healPotionId);
        }
        await pet.usePotion(Potion.中级活力药剂);
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
    await SAPet.default(cts[0]);
    await toggleAutoCure(false);
    await delay(300);

    const { Manager, Operator } = Battle;

    const strategy: Battle.MoveStrategy = {
        resolveMove(battleState, skills, battlePets) {
            if (battleState.self.hp.remain < hpLimit || !cts.includes(battleState.self.catchtime)) {
                const nextPet = this.resolveNoBlood(battleState, skills, battlePets) ?? -1;
                if (nextPet === -1) {
                    return Operator.escape();
                }
                return Operator.switchPet(nextPet);
            } else {
                return Operator.useSkill(skills.find((v) => v.category !== 4)!.id);
            }
        },
        resolveNoBlood: (battleState, skills, battlePets) =>
            battlePets.findIndex(
                (v) => cts.includes(v.catchTime) && v.hp >= hpLimit && v.catchTime !== battleState.self.catchtime
            ),
    };

    await Battle.Manager.run(() => {
        FightManager.fightNoMapBoss(6730);
    }, strategy);

    await delay(300);

    for (const ct of cts) {
        await usePotion(ct);
    }

    await delay(300);
    const leftCts = hpChecker();
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
            await SAPet.popFromBag(v);
        }
    }
    for (const v of cts) {
        await SAPet.setLocation(v, SAPetLocation.Bag);
    }
}

/**
 * @description 计算可用的高倍克制精灵(默认大于等于1.5)
 */
export async function calcAllEfficientPet(e: number, radio = 1.5) {
    const [bag1, bag2] = await PetDataManger.bag.get();
    const mini = (await PetDataManger.miniInfo.get()).values();
    const pets = [...bag1, ...bag2, ...mini];

    const r = pets.filter((v) => PetElement.formatById(PetXMLInfo.getType(v.id)).calcRatio(e) >= radio);
    return r.map((v) => {
        const eid = PetXMLInfo.getType(v.id);
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

    for (const [_, v] of universalMarks) {
        if (v.length > 5) {
            for (let i = 18; i < v.length; i++) {
                const mark = v[i];
                await Socket.sendByQueue(CommandID.COUNTERMARK_RESOLVE, [mark.obtainTime]);
                await delay(100);
            }
        }
    }
}

export async function updateBattleFireInfo() {
    // 类型: 2913,
    // 到期时间戳: 2914,
    return Socket.multiValue(2913, 2914).then((r) => ({
        type: r[0],
        valid: r[1] > 0 && SystemTimerManager.time < r[1],
        timeLeft: r[1] - SystemTimerManager.time,
    }));
}

export function updateBatteryTime() {
    const leftTime =
        MainManager.actorInfo.timeLimit -
        (MainManager.actorInfo.timeToday + Math.floor(Date.now() / 1000 - MainManager.actorInfo.logintimeThisTime));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    BatteryController.Instance._leftTime = Math.max(0, leftTime);
}

export function getClickTarget() {
    LevelManager.stage.once(egret.TouchEvent.TOUCH_BEGIN, (e: egret.TouchEvent) => console.log(e.target), null);
}

export { HelperLoader } from './helper.js';

