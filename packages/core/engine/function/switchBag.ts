import { Pet } from '../../entity/index.js';
import { PetLocation, SEAPet, getBagPets } from '../../pet-helper/index.js';

/**
 * 切换背包
 * 若数组为空, 则清空背包, 若数组长度大于6, 则截断至前六个
 * 注意数组的第一个元素**不一定会**被设为首发
 *
 * @param pets 要切换的精灵列表, 可以是ct或者Pet实例
 */
export async function switchBag(pets: number[] | Pet[]) {
    if (!pets) return;
    pets = pets.slice(0, 6);

    const cts = pets.map((v) => Pet.inferCatchTime(v));

    // 清空现有背包
    for (const v of await getBagPets(PetLocation.Bag)) {
        if (!cts.includes(v.catchTime)) {
            await SEAPet(v).popFromBag();
        }
    }

    for (const v of cts) {
        await SEAPet(v).setLocation(PetLocation.Bag);
    }
}
