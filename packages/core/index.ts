import { SeerAssistantCore } from './loader/index.js';

export * from './common/utils.js';
export * from './constant/index.js';

export * from './battle/index.js';
export * from './battle/level/index.js';
export * from './engine/index.js';
export * from './entity/index.js';
export * from './event-source/index.js';
export * from './pet-helper/index.js';

export type { VERSION } from './loader/index.js';
export const core = new SeerAssistantCore();

declare global {
    interface Window {
        /** 额外全局命名空间, 用以跨模块交互 */
        sea: SEA;
    }

    interface SEA {
        /** sea-core 全局单例 */
        core: SeerAssistantCore;
        /** 游戏核心加载就绪标志位 */
        SeerH5Ready: boolean;
        /**  game core loaded event */
        SEER_READY_EVENT: string;
    }
}
