import { extractObjectId } from '../common/utils.js';
import type { IItemObject, Pet } from '../entity/index.js';
import { Item } from '../entity/index.js';
import * as Socket from './socket.js';

export async function getItemNum(item: number | IItemObject) {
    const id = extractObjectId(item, Item.instanceKey);
    await new Promise((res) => ItemManager.updateItems([id], res));
    return ItemManager.getNumByID(id);
}

export async function isPetEffectActivated(pet: Pet): Promise<boolean> {
    if (!(pet.hasEffect && pet.unwrapped_effect)) return false;

    return new Promise((resolve) => {
        PetManager.checkPetInfoEffect({ id: pet.id, effectList: pet.unwrapped_effect! }, resolve);
    });
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

/**
 * 获取精英收藏的上限
 */
export async function getEliteLimit() {
    return Socket.multiValue(121020).then((r) => {
        let i = r[0];
        i = 255 & i;
        i += 1;
        i = 30 >= i ? i : 30;
        // eslint-disable-next-line
        return parseFloat(config.Brave_lv.getItem(i).storehouse);
    });
}

export async function getAutoCureState(): Promise<boolean> {
    const r = await Socket.bitSet(22439);
    return r[0];
}
