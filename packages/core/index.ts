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
export * from './pet-helper/index.js';

export type { CoreLoader, SetupOptions } from './internal/core.js';
export type { SEAEngine } from './internal/engine.js';
export type { GameConfigQuery, GameConfigRegistryEntity } from './internal/GameConfig.js';

export { seac } from './internal/core.js';
export { engine } from './internal/engine.js';
export { GameConfigRegistry, query } from './internal/GameConfig.js';
export { HookPointRegistry } from './internal/HookPointRegistry.js';
export * as socket from './internal/socket.js';
export { SocketDeserializerRegistry } from './internal/SocketDeserializerRegistry.js';

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
