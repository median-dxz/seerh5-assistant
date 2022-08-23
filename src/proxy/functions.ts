import { CMDID, ITEMS, PETPOS as PetPosType } from './const/_exports.js';
import { BattleInfoProvider, BattleModuleManager, BattleOperator } from './battle/battlemodule.js';
import * as PetHelper from './utils/pet-helper.js';
import { BuyPotion, SocketSendByQueue } from './utils/sa-utils.js';
import Skill from './entities/skill.js';
/**
 * @description 对精灵使用药水
 * @param {number} catchTime 精灵ct
 * @param {number} potionId 药水id
 */
export function UsePotionForPet(catchTime: number, potionId: number) {
    SocketSendByQueue(CMDID.USE_PET_ITEM_OUT_OF_FIGHT, [catchTime, potionId]);
}

/**
 * @param {PetLike[]} pets
 */
export async function SwitchBag(pets: PetLike[]) {
    // 清空现有背包
    let olds = await PetHelper.getPets(PetPosType.bag1);
    for (let v of olds) {
        await PetHelper.setPetLocation(v.catchTime, PetPosType.storage);
        console.log(`[PetHelper]: 将 ${v.name} 放入仓库`);
    }
    for (let v of pets) {
        await PetHelper.setPetLocation(v.catchTime, PetPosType.bag1);
        console.log(`[PetHelper]: 将 ${v.name} 放入背包`);
    }
}

/**
 * @description 计算可用的高倍克制精灵(默认大于等于1.5)
 * @param {Number} e 属性id
 * @param {Number} [radio=1.5] 倍率
 */
export async function calcAllEffecientPet(e: number, radio: number = 1.5) {
    await PetHelper.updateStroageInfo();
    let pets = [
        ...PetStorage2015InfoManager.allInfo,
        ...PetManager._bagMap.getValues(),
        ...PetManager._secondBagMap.getValues(),
    ];
    let r = pets.filter((v) => PetHelper.calcElementRatio(PetXMLInfo.getType(v.id), e) >= radio);
    return r.map((v_1) => {
        let eid = PetXMLInfo.getType(v_1.id);
        return {
            name: v_1.name,
            elementId: eid,
            element: SkillXMLInfo.typeMap[eid].cn,
            id: v_1.id,
            ratio: PetHelper.calcElementRatio(eid, e),
        };
    });
}

/**
 * @param {!number[]} cts 要压血的精灵列表
 * @param {number} [healPotionId=ITEMS.Potion.中级体力药剂] - 血药id, 默认中级体力药
 * @param {() => any} [cb] 回调函数
 * @description 利用谱尼封印自动压血
 */
export async function LowerBlood(cts: number[], healPotionId: number = ITEMS.Potion.中级体力药剂, cb: () => any) {
    if (!cts || cts.length == 0) {
        cb && cb();
        return;
    }

    // 检测列表是否全在背包
    let curPets = await PetHelper.getPets(PetPosType.bag1);

    for (let ct of cts) {
        if ((await PetHelper.getPetLocation(ct)) != PetPosType.bag1) {
            if (PetManager.isBagFull) {
                let replacePet = curPets.find((p) => ct != p.catchTime)!;
                console.log(`[SAHelper]: 压血 -> 将 ${replacePet.name} 放入仓库`);
                await PetHelper.setPetLocation(replacePet.catchTime, PetPosType.storage);
                curPets = await PetHelper.getPets(PetPosType.bag1);
            }
            await PetHelper.setPetLocation(ct, PetPosType.bag1);
        }
    }
    console.log(`[SAHelper]: 压血 -> 背包处理完成`);

    const hpChecker = () => cts.filter((ct) => PetManager.getPetInfo(ct).hp >= 200);

    cts = hpChecker();
    if (cts.length == 0) {
        cb && cb();
        return;
    }

    BuyPotion(ITEMS.Potion.中级活力药剂, cts.length);
    BuyPotion(healPotionId, cts.length);
    PetHelper.setDefault(cts[0]);
    await delay(500);

    BattleModuleManager.queuedModule(
        () => {
            FightManager.fightNoMapBoss(6730);
        },
        async (battleStatus, skills, battlePets) => {
            if (battleStatus.round > 0 && battleStatus.self?.hp.remain! < 50) {
                let nextPet = -1;
                for (let v of battlePets) {
                    if (cts.includes(v.catchTime) && v.hp > 200 && v.catchTime != battleStatus.self?.petCatchtime) {
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
                    skills = BattleInfoProvider.getCurSkills() as Skill[];
                    BattleOperator.useSkill(skills.find((v) => v.category != 4)!.id);
                }
            } else {
                await delay(400);
                BattleOperator.useSkill(skills.find((v) => v.category != 4)!.id);
            }
        },
        async () => {
            await delay(100);
            for (let ct of cts) {
                if (PetManager.getPetInfo(ct).hp <= 50) {
                    UsePotionForPet(ct, healPotionId);
                    await delay(100);
                }
                UsePotionForPet(ct, ITEMS.Potion.中级活力药剂);
                await delay(100);
            }
            let notLowerPets = hpChecker();
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
    type CountermarkGroup = Map<string, Array<any>>;
    const umarks: CountermarkGroup = CountermarkController.getAllUniversalMark().reduce((pre: CountermarkGroup, v: any) => {
        const name: string = v.markName;
        if (v.catchTime == 0 && v.isBindMon == false && v.level < 5) {
            if (pre.has(name)) {
                pre.get(name)!.push(v);
            } else {
                pre.set(v.markName, [v]);
            }
        }
        return pre;
    }, new Map());

    for (let [k, v] of umarks) {
        if (v.length > 5) {
            for (let i in v) {
                if ((i as unknown) as number >= 14) {
                    const mark = v[i];
                    const result = await SocketSendByQueue(CommandID.COUNTERMARK_RESOLVE, [mark.obtainTime]);
                    await delay(100);
                }
            }
        }
    }
}
