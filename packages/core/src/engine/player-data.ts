import { extractObjectId } from '../common';
import { IItemObject, Item } from '../entity/Item';
import * as Socket from './socket';

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

/**
 * @returns 返回玩家拥有的能力称号id列表
 */
export async function UserAbilityTitles(): Promise<number[]> {
    return Socket.sendByQueue(CommandID.ACHIEVETITLELIST)
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
