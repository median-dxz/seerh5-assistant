import { CMDID } from "../const/_exports.js";
import { SocketSendByQueue } from "./sa-socket.js";

/**
 * @description 购买药水
 * @param {Number} potionId 药水id
 * @param {Number} amount  数量
 */
 export function BuyPotion(potionId, amount) {
    SocketSendByQueue(CMDID.ITEM_BUY, [potionId, amount]);
}