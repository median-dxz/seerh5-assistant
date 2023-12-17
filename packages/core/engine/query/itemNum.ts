import { EntityBase } from '../../entity/EntityBase.js';
import type { Item } from '../../entity/Item.js';

/**
 * 获取物品数量
 *
 * @param item 物品ID或物品实例
 */
export async function itemNum(item: number | Item) {
    const id = EntityBase.inferId(item);
    await new Promise((res) => ItemManager.updateItems([id], res));
    return ItemManager.getNumByID(id);
}
