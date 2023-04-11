import { extractObjectId } from '../common';
import { IItemObject, Item } from '../entity/Item';
import * as Socket from './socket';

export function getItemNum(item: number | IItemObject) {
    let id = extractObjectId(item, Item.instanceKey);
    return ItemManager.getNumByID(id);
}

/**
 * @returns 返回玩家拥有的能力称号id列表
 */
export async function getUserAbilityTitles(): Promise<number[]> {
    return Socket.sendByQueue(CommandID.ACHIEVETITLELIST)
        .then((r) => new egret.ByteArray(r))
        .then((r) => new AchieveTitleInfo(r))
        .then((r) => r.titleArr.filter(AchieveXMLInfo.isAbilityTitle.bind(AchieveXMLInfo)));
}

/**
 * @returns 返回当前使用的称号id
 */
export function getUserTitle(): number {
    return MainManager.actorInfo.curTitle;
}

/**
 * @returns 返回玩家拥有的能力套装id列表
 */
export function getUserAbilitySuits() {
    return ItemManager.GetMySuitIds().filter(ItemSeXMLInfo.getIsEffSuit.bind(ItemSeXMLInfo));
}

/**
 * @returns 返回当前使用的套装id
 */
export function getUserSuit(): number {
    return SuitXMLInfo.getSuitID(MainManager.actorInfo.clothIDs);
}
