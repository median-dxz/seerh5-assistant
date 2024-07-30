/**
 * 获取当前使用的套装id
 * 注意此函数是同步调用
 */
export const playerSuit = () => SuitXMLInfo.getSuitIDs(MainManager.actorInfo.clothIDs)[0];
