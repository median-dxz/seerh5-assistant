/**
 * 获取当前使用的套装id
 * 注意此函数是同步调用
 */
export function playerSuit(): number {
    return SuitXMLInfo.getSuitID(MainManager.actorInfo.clothIDs);
}
