import { SocketSendByQueue } from './socket';

/**
 * @returns 返回玩家拥有的能力称号id列表
 */
export async function UserAbilityTitles(): Promise<number[]> {
    return SocketSendByQueue(CommandID.ACHIEVE_TITLE_LIST)
        .then((r) => new egret.ByteArray(r))
        .then((r) => new AchieveTitleInfo(r))
        .then((r) => r.titleArr.filter(AchieveXMLInfo.isAbilityTitle.bind(AchieveXMLInfo)));
}

/**
 * @returns 返回当前使用的称号id
 */
export function UserTitle(): number {
    return MainManager.actorInfo.curTitle;
}

export async function ChangeTitle(title: number): Promise<boolean> {
    if (MainManager.actorInfo.curTitle !== title) {
        try {
            await SocketSendByQueue(CommandID.SET_TITLE, [title]);
            MainManager.actorInfo.curTitle = title;
            return true;
        } catch (err) {
            return false;
        }
    }
    return false;
}

/**
 * @returns 返回玩家拥有的能力套装id列表
 */
export function UserAbilitySuits() {
    return ItemManager.GetMySuitIds().filter(ItemSeXMLInfo.getIsEffSuit.bind(ItemSeXMLInfo));
}

/**
 * @returns 返回当前使用的套装id
 */
export function UserSuit(): number {
    return SuitXMLInfo.getSuitID(MainManager.actorInfo.clothIDs);
}

export async function ChangeSuit(suit: number): Promise<boolean> {
    if (UserSuit() !== suit) {
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
    return false;
}
