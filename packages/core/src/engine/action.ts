import * as Socket from './socket';

export async function ChangeSuit(suit: number): Promise<boolean> {
    try {
        return new Promise((resolve) => {
            MainManager.actorInfo.requestChangeClotherBySuit(suit, () => {
                resolve(true);
            });
        });
    } catch (err) {
        return false;
    }
}

/**
 * @description 购买精灵物品(药剂和胶囊)
 */
export function BuyPetItem(potionId: number, amount: number) {
    Socket.sendByQueue(CommandID.ITEM_BUY, [potionId, amount]);
}
