import { buyPetItem } from '../mutate/buyPetItem.js';
import { fightBoss } from '../mutate/fightBoss.js';
import { toggleAutoCure } from '../mutate/toggleAutoCure.js';

import { Manager, Operator, type MoveStrategy, type RoundData } from '../../battle/index.js';
import { delay, type ValueOf } from '../../common/utils.js';
import { PetPosition, Potion } from '../../constant/index.js';

import { Pet } from '../../entity/index.js';
import { getBagPets, PetLocation, SEAPet } from '../../pet-helper/index.js';

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
    const curPets = await getBagPets(PetPosition.bag1);
    const replacePets = curPets.filter((p) => !cts.includes(p.catchTime));

    for (const ct of cts) {
        const location = await SEAPet.location(ct);
        if (location !== PetLocation.Bag && location !== PetLocation.Default) {
            if (PetManager.isBagFull) {
                const replacePet = replacePets.pop()!;
                await replacePet.popFromBag();
            }
            await SEAPet.setLocation(ct, PetLocation.Bag);
        }
    }
    await getBagPets();

    const hpChecker = () => cts.filter((ct) => SEAPet(ct).hp >= hpLimit);

    const usePotion = async (ct: number) => {
        let pet = await SEAPet.get(ct);
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
    await SEAPet.default(cts[0]);
    await toggleAutoCure(false);
    await delay(300);

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

    await delay(300);

    for (const ct of cts) {
        await usePotion(ct);
    }

    await delay(300);
    const leftCts = hpChecker();
    if (leftCts.length > 0) {
        return lowerHp(leftCts, healPotionId);
    } else {
        await getBagPets();
        Manager.clear();
        return;
    }
}
