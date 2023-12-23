/**
 * 获取当前使用的称号id
 * 注意此函数是同步调用
 */
export function playerTitle() {
    return MainManager.actorInfo.curTitle;
}
