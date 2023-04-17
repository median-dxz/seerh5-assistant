import * as Socket from './socket';

export async function changeSuit(suit: number): Promise<boolean> {
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

export async function changeTitle(title: number): Promise<boolean> {
    if (MainManager.actorInfo.curTitle !== title) {
        try {
            await Socket.sendByQueue(CommandID.SETTITLE, [title]);
            MainManager.actorInfo.curTitle = title;
            return true;
        } catch (err) {
            return false;
        }
    }
    return false;
}

/**
 * 购买精灵物品(药剂和胶囊)
 */
export async function buyPetItem(potionId: number, amount: number) {
    return Socket.sendByQueue(CommandID.ITEM_BUY, [potionId, amount]);
}

export function toggleAutoCure(enable: boolean) {
    Socket.sendByQueue(42019, [22439, Number(enable)]);
}
