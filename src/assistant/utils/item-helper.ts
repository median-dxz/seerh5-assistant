import { CMDID } from '../const';
import { SocketSendByQueue } from './socket';

/**
 * @description 购买精灵物品(药剂和胶囊)
 */
export function BuyPetItem(potionId: number, amount: number) {
    SocketSendByQueue(CMDID.ITEM_BUY, [potionId, amount]);
}

export async function UpdateItemValues(...itemIds: number[]) {
    if (itemIds.length == 0) return;
    return new Promise<void>((resolve, reject) => {
        ItemManager.updateItems(itemIds, () => {
            resolve();
        });
    });
}