declare global {
    interface Window {
        sea: SEA;
    }

    interface SEA {
        /** 正则过滤列表 */
        logRegexFilter: { log: RegExp[]; warn: RegExp[] };
    }
}

declare module 'sea-core' {
    export interface Engine {
        updateBattleFireInfo: typeof updateBattleFireInfo;
    }
}

import { extendEngine } from 'sea-core/engine';
import { updateBattleFireInfo } from './engine';

export default () => {
    extendEngine({ updateBattleFireInfo });
};
