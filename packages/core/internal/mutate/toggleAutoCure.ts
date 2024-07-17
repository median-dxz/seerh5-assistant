import { sendByQueue } from '../socket.js';

/**
 * 切换自动治疗状态
 *
 * @param enable 是否开启自动治疗
 */
export const toggleAutoCure = (enable: boolean) => sendByQueue(42019, [22439, Number(enable)]);
