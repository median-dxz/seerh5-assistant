import { SEAPetStore } from '../../pet-helper/PetStore.js';
import * as socket from '../socket.js';

/**
 * 治疗所有背包中的精灵
 */
export const cureAllPet = async () => {
    const pets = (await SEAPetStore.bag.get()).flat();
    if (pets.length === 0) {
        return;
    }
    if (
        pets.every(
            (pet) =>
                pet.hp === pet.maxHp &&
                pet.skills.every((skill) => skill.pp === skill.maxPP) &&
                pet.fifthSkill?.pp === pet.fifthSkill?.maxPP
        )
    ) {
        return;
    }

    await socket.sendByQueue(CommandID.PET_CURE_FREE);
    await SEAPetStore.bag.get();
    PetManager.dispatchEvent(new PetEvent(PetEvent.CURE_COMPLETE, 0));
};
