import { EntityBase } from '../../entity/EntityBase.js';
import type { IItemObject } from '../../entity/index.js';

/**
 * 获取物品数量
 *
 * @param item 物品ID或物品对象
 */
export async function itemNum(item: number | IItemObject) {
    const id = EntityBase.inferId(item);
    await new Promise((res) => ItemManager.updateItems([id], res));
    return ItemManager.getNumByID(id);
}
