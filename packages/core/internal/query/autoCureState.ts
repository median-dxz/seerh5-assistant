import { bitSet } from '../socket.js';

/**
 * 获取自动治疗的状态
 */
export const autoCureState = async () => {
    const r = await bitSet(22439);
    return r[0];
};
