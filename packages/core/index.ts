export type { SEACLogEvent, Serializable } from './common/logger.js';
export type { AnyFunction, Constructor, ValueOf, WithClass } from './common/utils.js';

export * from './battle/index.js';
export {
    assertIsHookedFunction,
    assertIsWrappedFunction,
    debounce,
    delay,
    hookConstructor,
    hookFn,
    hookPrototype,
    NOOP,
    restoreHookedFn,
    throttle,
    wrapper
} from './common/utils.js';
export * from './constant/index.js';
export * from './entity/index.js';
export * from './event-source/index.js';
export * from './internal/index.js';
export * from './pet-helper/index.js';

import type { CoreLoader } from './internal/core.js';

declare global {
    interface Window {
        /** 额外全局命名空间, 用以跨模块交互 */
        sea: SEA;
    }

    interface SEA {
        /** seac 全局单例 */
        seac: CoreLoader;
        /** 游戏核心加载就绪标志位 */
        SeerH5Ready: boolean;
        /**  game core loaded event */
        SEER_READY_EVENT: string;
    }
}
