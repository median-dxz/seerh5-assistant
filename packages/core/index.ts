export * from './common/utils.js';
export * from './constant/index.js';

export * from './battle/index.js';
export * from './data-source/index.js';
export * from './engine/index.js';
export * from './entity/index.js';
export * from './level/index.js';
export * from './pet-helper/index.js';

export { CoreLoader } from './loader/index.js';

declare global {
    interface Window {
        /** 额外全局命名空间, 用以跨模块交互 */
        sea: SEA;
    }

    interface SEA {
        /** SEA Core就绪标志 */
        CoreReady: boolean;
        /** SEA 全局单例标志位 */
        CoreInstance: boolean;
    }
}
