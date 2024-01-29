import type { Pet } from '../../entity/index.js';

/**
 * 查询精灵是否激活
 *
 * @returns 如果激活魂印则返回 true, 否则包括没有魂印在内, 都返回false
 */
export async function isPetEffectActivated(pet: Pet): Promise<boolean> {
    if (!(pet.hasEffect && pet.unwrapped_effect)) return false;

    return new Promise((resolve) => {
        PetManager.checkPetInfoEffect({ id: pet.id, effectList: pet.unwrapped_effect! }, resolve);
    });
}
