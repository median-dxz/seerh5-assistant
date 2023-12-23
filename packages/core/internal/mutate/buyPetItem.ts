import { sendByQueue } from '../socket.js';

/**
 * 购买精灵物品(药剂和胶囊)
 */
export function buyPetItem(potionId: number, amount: number) {
    return sendByQueue(CommandID.ITEM_BUY, [potionId, amount]);
}
