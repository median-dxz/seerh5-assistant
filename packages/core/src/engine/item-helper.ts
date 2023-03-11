import { extractObjectId } from '../common';
import { IItemObject, Item } from '../entity/Item';
import { SocketSendByQueue } from './socket';

/**
 * @description 购买精灵物品(药剂和胶囊)
 */
export function BuyPetItem(potionId: number, amount: number) {
    SocketSendByQueue(CommandID.ITEM_BUY, [potionId, amount]);
}

export async function UpdateItemValues(...itemIds: number[]) {
    if (itemIds.length == 0) return;
    return new Promise<void>((resolve, reject) => {
        ItemManager.updateItems(itemIds, resolve);
    });
}

export async function getItemNum(item: number | IItemObject) {
    let id = extractObjectId(item, Item.instanceKey);
    return ItemManager.getNumByID(id);
}
