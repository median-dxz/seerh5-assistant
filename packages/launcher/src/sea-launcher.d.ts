/* eslint-disable */
declare module 'sea-core' {
    export interface Engine {
        updateBattleFireInfo(): Promise<{
            type: number;
            valid: boolean;
            timeLeft: number;
        }>;
    }
}

declare global {
    interface SEA {
        /** 正则过滤列表 */
        logRegexFilter: { log: RegExp[]; warn: RegExp[] };
        EVENT_SEER_READY: string;
    }
}

declare namespace baseMenuComponent {
    class BaseMenuComponent {
        selectedValue: any;
    }
}

export { };

