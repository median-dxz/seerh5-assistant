import { EntityBase } from '../../entity/EntityBase.js';
import type { IItemObject } from '../../entity/index.js';

export async function itemNum(item: number | IItemObject) {
    const id = EntityBase.inferId(item);
    await new Promise((res) => ItemManager.updateItems([id], res));
    return ItemManager.getNumByID(id);
}
