import { sendByQueue } from '../socket.js';

/**
 * @returns 返回玩家拥有的能力称号id列表
 */
export const playerAbilityTitles = async () =>
    sendByQueue(CommandID.ACHIEVETITLELIST)
        .then((r) => new egret.ByteArray(r))
        .then((r) => new AchieveTitleInfo(r))
        .then((r) => r.titleArr.filter(AchieveXMLInfo.isAbilityTitle.bind(AchieveXMLInfo)));
