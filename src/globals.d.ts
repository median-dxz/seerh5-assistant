import * as SA from './assisant/core';
import { delay, warpper } from './utils';
declare global {
    interface Window {
        SA: typeof SA;
        SAEventTarget: EventTarget;
        delay: typeof delay;
        warpper: typeof warpper;
        filterLogText: RegExp[];
        filterWarnText: RegExp[];
        SAMods: Map<string, import('./assisant/modloader').Mod>;
        SACoreReady: boolean;

        [module: string]: any;
    }
    type Fn = (...args: any) => void;
    type CallBack = Fn;
    type NullOrUndefindedable<T> = T | undefined | null;
    type AttrConsts<T> = T[keyof T];

    interface ModClass {
        init: Fn;
        run?: Fn;
        runOnce?: Fn;
        update?: Fn;
        meta: {
            description: string;
        };
    }
}
