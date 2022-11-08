import { InfoProvider, ModuleManager, Operator } from '../battle-module';
import { CMDID, ITEMS, PETPOS as PetPosType } from '../const';
import Pet from '../entities/pet';
import Skill from '../entities/skill';
import * as PetHelper from '../pet-helper';
import { BuyPetItem, SocketReceivedPromise, SocketSendByQueue } from '../utils';

import { defaultStyle, SaModuleLogger } from '../../logger';
import { delay } from '../../utils';
const log = SaModuleLogger('SAFunctions', defaultStyle.mod);
/**
 * @description 刻印直升5级
 */
export async function upMarkToTopLv(markInfo: CountermarkInfo) {
    let lv = 5 - CountermarkController.getInfo(markInfo.obtainTime).level!;
    while (lv--) {
        await SocketSendByQueue(CMDID.STRENGTHEN_COUNTERMARK, markInfo.obtainTime);
        await SocketSendByQueue(CMDID.SAVE_COUNTERMARK_PROPERTY, markInfo.obtainTime);
    }
    SocketReceivedPromise(CMDID.GET_COUNTERMARK_LIST2, () => {
        CountermarkController.updateMnumberMark({ markID: markInfo.markID, catchTime: markInfo.obtainTime });
    });
    EventManager.dispatchEvent(
        new CountermarkEvent(CountermarkEvent.UPGRADE_END, CountermarkController.getInfo(markInfo.obtainTime))
    );
}

/**
 * @description 对精灵使用药水
 */
export function UsePotionForPet(catchTime: number, potionId: number) {
    SocketSendByQueue(CMDID.USE_PET_ITEM_OUT_OF_FIGHT, [catchTime, potionId]);
}

export async function SwitchBag(pets: Pick<SAType.PetLike, 'catchTime' | 'name'>[]) {
    // 清空现有背包
    for (let v of await PetHelper.getBagPets(PetPosType.bag1)) {
        await PetHelper.setPetLocation(v.catchTime, PetPosType.storage);
        log(`SwitchBag -> 将 ${v.name} 放入仓库`);
    }
    for (let v of pets) {
        await PetHelper.setPetLocation(v.catchTime, PetPosType.bag1);
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

type PotionId = AttrConst<typeof ITEMS.Potion>;
/**
 * @param {} cts 要压血的精灵列表
 * @param {} healPotionId 血药id, 默认中级体力药
 * @param {} cb 回调函数
 * @description 利用谱尼封印自动压血
 */
export async function LowerBlood(cts: number[], healPotionId: PotionId = ITEMS.Potion.中级体力药剂, cb: () => any) {
    if (!cts || cts.length === 0) {
        cb && cb();
        return;
    }

    // 检测列表是否全在背包
    let curPets = await PetHelper.getBagPets(PetPosType.bag1);

    for (let ct of cts) {
        if ((await PetHelper.getPetLocation(ct)) !== PetPosType.bag1) {
            if (PetManager.isBagFull) {
                let replacePet = curPets.find((p) => ct !== p.catchTime)!;
                log(`压血 -> 将 ${replacePet.name} 放入仓库`);
                await PetHelper.setPetLocation(replacePet.catchTime, PetPosType.storage);
                curPets = await PetHelper.getBagPets(PetPosType.bag1);
            }
            await PetHelper.setPetLocation(ct, PetPosType.bag1);
        }
    }
    log(`压血 -> 背包处理完成`);

    const hpChecker = () => cts.filter((ct) => PetManager.getPetInfo(ct).hp >= 200);
    const finish = async () => {
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
    };

    await delay(200);
    if (hpChecker().length === 0) {
        finish();
        return;
    }

    BuyPetItem(ITEMS.Potion.中级活力药剂, cts.length);
    BuyPetItem(healPotionId, cts.length);
    PetHelper.setDefault(cts[0]);
    await delay(500);

    ModuleManager.queuedModule({
        entry() {
            FightManager.fightNoMapBoss(6730);
        },
        async skillModule(battleStatus, skills, battlePets) {
            if (battleStatus.round > 0 && battleStatus.self?.hp.remain! < 50) {
                let nextPet = -1;
                for (let v of battlePets) {
                    if (cts.includes(v.catchTime) && v.hp > 200 && v.catchTime !== battleStatus.self!.catchtime) {
                        nextPet = v.index;
                        break;
                    }
                }
                log(nextPet);
                if (nextPet === -1) {
                    Operator.escape();
                    return;
                }
                Operator.switchPet(nextPet);
                if (battleStatus.isDiedSwitch) {
                    await delay(400);
                    skills = InfoProvider.getCurSkills() as Skill[];
                    Operator.useSkill(skills.find((v) => v.category !== 4)!.id);
                }
            } else {
                await delay(400);
                Operator.useSkill(skills.find((v) => v.category !== 4)!.id);
            }
        },
        finished: finish,
    });
    ModuleManager.runOnce();
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
