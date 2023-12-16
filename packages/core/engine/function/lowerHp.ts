import { buyPetItem } from '../mutate/buyPetItem.js';
import { fightBoss } from '../mutate/fightBoss.js';
import { toggleAutoCure } from '../mutate/toggleAutoCure.js';

import { Manager, Operator, type MoveStrategy, type RoundData } from '../../battle/index.js';
import { delay, type ValueOf } from '../../common/utils.js';
import { Potion } from '../../constant/index.js';

import { Pet } from '../../entity/index.js';
import { PetLocation, SEAPet, getBagPets } from '../../pet-helper/index.js';

/**
 * 利用谱尼封印自动压血
 *
 * @param pets 要压血的精灵列表, 可以是Pet实例或catchTime
 * @param healPotionId 血药id, 默认中级体力药
 * @param hpLimit 血量上限, 默认200, 压血后全部精灵血量低于该值
 */
export async function lowerHp(
    pets: number[],
    healPotionId: ValueOf<typeof Potion> = Potion.中级体力药剂,
    hpLimit = 200
): Promise<void> {
    pets = pets.slice(0, 6);
    if (!pets || pets.length === 0) {
        return;
    }

    const cts = pets.map((v) => Pet.inferCatchTime(v));

    // 检测列表是否全在背包
    const curPets = await getBagPets(PetLocation.Bag);
    const replacePets = curPets.filter((p) => !cts.includes(p.catchTime));

    for (const ct of cts) {
        const location = await SEAPet(ct).location();
        if (location !== PetLocation.Bag && location !== PetLocation.Default) {
            if (PetManager.isBagFull) {
                const replacePet = replacePets.pop()!;
                await replacePet.popFromBag();
            }
            await SEAPet(ct).setLocation(PetLocation.Bag);
        }
    }

    let remains: Pet[];
    const hpFilter = async () => {
        const pets = await Promise.all(cts.map(SEAPet).map((pet) => pet.get()));
        return pets.filter((v) => v.hp >= hpLimit);
    };

    const usePotion = async (ct: number) => {
        let pet = await SEAPet(ct).get();
        if (pet.hp == 0) {
            pet = await pet.usePotion(healPotionId);
        }
        await pet.usePotion(Potion.中级活力药剂);
    };

    remains = await hpFilter();
    if (remains.length === 0) {
        for (const ct of cts) {
            await usePotion(ct);
        }
        return;
    }

    buyPetItem(Potion.中级活力药剂, remains.length);
    buyPetItem(healPotionId, remains.length);
    await SEAPet(remains[0]).default();
    await toggleAutoCure(false);

    const checkNextPet = (battleState: RoundData, pets: Pet[]) =>
        pets.findIndex(
            (v) => cts.includes(v.catchTime) && v.hp >= hpLimit && v.catchTime !== battleState.self.catchtime
        );

    const strategy: MoveStrategy = {
        resolveMove(battleState, skills, pets) {
            if (battleState.self.hp.remain < hpLimit || !cts.includes(battleState.self.catchtime)) {
                return this.resolveNoBlood(battleState, skills, pets);
            } else {
                return Operator.useSkill(skills.find((v) => v.category !== 4)!.id);
            }
        },
        resolveNoBlood: (battleState, _, pets) => {
            const nextPet = checkNextPet(battleState, pets);
            if (nextPet === -1) {
                return Operator.escape();
            }
            return Operator.switchPet(nextPet);
        },
    };

    await Manager.takeover(() => {
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
        Manager.clear();
        return;
    }
}
