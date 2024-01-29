import { buyPetItem } from '../mutate/buyPetItem.js';
import { fightBoss } from '../mutate/fightBoss.js';
import { toggleAutoCure } from '../mutate/toggleAutoCure.js';

import { battle, type MoveStrategy, type RoundData } from '../../battle/index.js';
import { delay, type ValueOf } from '../../common/utils.js';
import { PotionId, SkillType } from '../../constant/index.js';

import { Pet } from '../../entity/index.js';
import { PetLocation, SEAPetStore, spet } from '../../pet-helper/index.js';

/**
 * 利用谱尼封印自动压血
 *
 * @param pets 要压血的精灵列表, 可以是Pet实例或catchTime
 * @param healPotionId 血药id, 默认中级体力药
 * @param hpLimit 血量上限, 默认200, 压血后全部精灵血量低于该值
 */
export async function lowerHp(
    pets: number[],
    healPotionId: ValueOf<typeof PotionId> = PotionId.中级体力药剂,
    hpLimit = 200
): Promise<void> {
    pets = pets.slice(0, 6);
    if (!pets || pets.length === 0) {
        return;
    }

    const cts = pets.map((v) => Pet.inferCatchTime(v));

    // 检测列表是否全在背包
    const curPets = await SEAPetStore.getBagPets(PetLocation.Bag);
    const replacePets = curPets.filter((p) => !cts.includes(p.catchTime));

    for (const ct of cts) {
        const location = await spet(ct).location();
        if (location !== PetLocation.Bag && location !== PetLocation.Default) {
            if (PetManager.isBagFull) {
                const replacePet = replacePets.pop()!;
                await replacePet.popFromBag();
            }
            await spet(ct).setLocation(PetLocation.Bag);
        }
    }

    let remains: Pet[];
    const hpFilter = async () => {
        const pets = await Promise.all(cts.map(spet).map((pet) => pet.get()));
        return pets.filter((v) => v.hp >= hpLimit);
    };

    const usePotion = async (ct: number) => {
        let pet = await spet(ct).get();
        if (pet.hp == 0) {
            pet = await pet.usePotion(healPotionId);
        }
        await pet.usePotion(PotionId.中级活力药剂);
    };

    remains = await hpFilter();
    if (remains.length === 0) {
        for (const ct of cts) {
            await usePotion(ct);
        }
        return;
    }

    buyPetItem(PotionId.中级活力药剂, remains.length);
    buyPetItem(healPotionId, remains.length);
    await spet(remains[0]).default();
    await toggleAutoCure(false);

    const checkNextPet = (battleState: RoundData, pets: Pet[]) =>
        pets.findIndex(
            (v) => cts.includes(v.catchTime) && v.hp >= hpLimit && v.catchTime !== battleState.self.catchtime
        );

    const { executor: operator, manager } = battle;

    const strategy: MoveStrategy = {
        resolveMove(battleState, skills, pets) {
            if (battleState.self.hp.remain < hpLimit || !cts.includes(battleState.self.catchtime)) {
                return this.resolveNoBlood(battleState, skills, pets);
            } else {
                return operator.useSkill(skills.find((v) => v.category !== SkillType.属性攻击)!.id);
            }
        },
        resolveNoBlood: (battleState, _, pets) => {
            const nextPet = checkNextPet(battleState, pets);
            if (nextPet === -1) {
                return operator.escape();
            }
            return operator.switchPet(nextPet);
        }
    };

    await manager.takeover(() => {
        fightBoss(6730);
    }, strategy);

    for (const ct of cts) {
        await usePotion(ct);
    }

    await delay(300);
    remains = await hpFilter();
    if (remains.length > 0) {
        return lowerHp(
            remains.map((pet) => pet.catchTime),
            healPotionId
        );
    } else {
        manager.clear();
        return;
    }
}
