import * as SA from './assistant/core';
import { delay, wrapper } from './utils';
declare global {
    interface Window {
        SA: typeof SA;
        SAEventTarget: EventTarget;
        delay: typeof delay;
        wrapper: typeof wrapper;
        filterLogText: RegExp[];
        filterWarnText: RegExp[];
        SAMods: Map<string, import('./assistant/modloader').Mod>;
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
