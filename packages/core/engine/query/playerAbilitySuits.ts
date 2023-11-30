/**
 * 获取玩家拥有的能力套装id列表
 * 
 * 注意此函数是同步调用的
 */
export function playerAbilitySuits() {
    return ItemManager.GetMySuitIds().filter(ItemSeXMLInfo.getIsEffSuit.bind(ItemSeXMLInfo));
}
