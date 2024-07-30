import { sendByQueue } from '../socket.js';

/**
 * 购买精灵物品(药剂和胶囊)
 */
export const buyPetItem = (potionId: number, amount: number) => sendByQueue(CommandID.ITEM_BUY, [potionId, amount]);
