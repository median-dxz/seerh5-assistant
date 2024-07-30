import { sendByQueue } from '../socket.js';

/**
 * 切换自动治疗状态
 *
 * @param enable 是否开启自动治疗
 */
export const toggleAutoCure = (enable: boolean) => {
    const buf = new egret.ByteArray();
    buf.writeShort(22439);
    buf.writeBoolean(enable);
    return sendByQueue(42036, [1, buf]);
};
