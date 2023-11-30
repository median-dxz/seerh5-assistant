import { bitSet } from '../socket.js';

/**
 * 获取自动治疗的状态
 */
export async function autoCureState(): Promise<boolean> {
    const r = await bitSet(22439);
    return r[0];
}
