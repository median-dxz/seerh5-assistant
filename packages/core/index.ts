export * from './common/utils.js';
export * from './constant/index.js';

export * from './battle/index.js';
export * from './emitter/index.js';
export * from './engine/index.js';
export * from './entity/index.js';
export * from './level/index.js';

export * from './functions/index.js';
export * from './pet-helper/index.js';

export { CoreLoader } from './loader/index.js';

declare global {
    interface Window {
        /** 额外全局命名空间, 用以跨模块交互 */
        sea: {
            /** 游戏客户端就绪标志 */
            SeerH5Ready: boolean;
            /** SEA Core就绪标志 */
            CoreReady: boolean;
        };
    }
}
