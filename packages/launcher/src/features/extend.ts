declare global {
    interface SEA {
        /** 正则过滤列表 */
        logRegexFilter: { log: RegExp[]; warn: RegExp[] };
        EVENT_SEER_READY: string;
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
