import { SEACore } from './loader/index.js';

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
export * from './entity/index.js';
export * from './event-source/index.js';
export * from './pet-helper/index.js';

export type { VERSION } from './loader/index.js';
export const core = new SEACore();

declare global {
    interface Window {
        /** 额外全局命名空间, 用以跨模块交互 */
        sea: SEA;
    }

    interface SEA {
        /** seac 全局单例 */
        seac: SEACore;
        /** 游戏核心加载就绪标志位 */
        SeerH5Ready: boolean;
        /**  game core loaded event */
        SEER_READY_EVENT: string;
    }
}
