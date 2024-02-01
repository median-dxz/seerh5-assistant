/**
 * 切换套装
 *
 * @param suit 套装id
 */
export async function changeSuit(suit: number): Promise<boolean> {
    try {
        await new Promise<void>((resolve) => {
            MainManager.actorInfo.requestChangeClotherBySuit(suit, resolve, undefined, MainManager.actorInfo);
        });
        // 问就是淘米的神奇接口定义
        return true;
    } catch (err) {
        return false;
    }
}
