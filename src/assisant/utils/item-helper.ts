import { CMDID } from "../const/_exports";
import { SocketSendByQueue } from "./sa-socket";

/**
 * @description 购买药水
 */
 export function BuyPotion(potionId: number, amount: number) {
    SocketSendByQueue(CMDID.ITEM_BUY, [potionId, amount]);
}