export {
    NOOP,
    assertIsHookedFunction,
    assertIsWrappedFunction,
    coreLog,
    debounce,
    delay,
    experiment_hookConstructor,
    hookFn,
    hookPrototype,
    restoreHookedFn,
    throttle,
    wrapper
} from './common/utils.js';
export type { AnyFunction, Constructor, ValueOf, WithClass } from './common/utils.js';

export * from './constant/index.js';

export * from './battle/index.js';
export * from './battle/level/index.js';
export * from './engine/index.js';
export type { VERSION } from './engine/index.js';
export * from './entity/index.js';
export * from './event-source/index.js';
export * from './pet-helper/index.js';

import { SEAC } from './engine/index.js';
export const seac = new SEAC();

declare global {
    interface Window {
        /** 额外全局命名空间, 用以跨模块交互 */
        sea: SEA;
    }

    interface SEA {
        /** seac 全局单例 */
        seac: SEAC;
        /** 游戏核心加载就绪标志位 */
        SeerH5Ready: boolean;
        /**  game core loaded event */
        SEER_READY_EVENT: string;
    }
}
