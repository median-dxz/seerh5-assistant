import { PetPosition } from '../../constant/index.js';
import { Pet } from '../../entity/index.js';
import { PetLocation, SEAPet, getBagPets } from '../../pet-helper/index.js';

/**
 * 切换背包
 * 若数组为空, 则不进行任何操作, 若数组长度大于6, 则截断至前六个
 * 
 * @param pets 要切换的精灵列表, 可以是ct或者Pet实例
 */
export async function switchBag(pets: number[] | Pet[]) {
    pets = pets.slice(0, 6);
    if (!pets || pets.length === 0) {
        return;
    }

    const cts = pets.map((v) => Pet.inferCatchTime(v));

    // 清空现有背包
    for (const v of await getBagPets(PetPosition.bag1)) {
        if (!cts.includes(v.catchTime)) {
            await SEAPet.popFromBag(v);
        }
    }
    for (const v of cts) {
        await SEAPet.setLocation(v, PetLocation.Bag);
    }
}
