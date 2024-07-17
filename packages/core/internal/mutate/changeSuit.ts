/**
 * 切换套装
 *
 * @param suit 套装id
 */
export const changeSuit = async (suit: number) => {
    try {
        await new Promise<void>((resolve) => {
            MainManager.actorInfo.requestChangeClotherBySuit(suit, resolve, undefined, MainManager.actorInfo);
        });
        // 问就是淘米的神奇接口定义
        return true;
    } catch (err) {
        return false;
    }
};
