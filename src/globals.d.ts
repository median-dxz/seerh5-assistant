import * as SACore from './assistant';
import { delay, wrapper } from './utils';

declare global {
    var SA: typeof SACore;
    interface Window {
        SAEventTarget: EventTarget;
        delay: typeof delay;
        wrapper: typeof wrapper;
        filterLogText: RegExp[];
        filterWarnText: RegExp[];
        SAMods: Map<string, import('./assistant/mod-type').Mod>;
        SACoreReady: boolean;
    }

    type CallBack = Function;
    type AttrConst<T> = T[keyof T];

    interface ModClass {
        init: VoidFunction;
        run?: VoidFunction;
        runOnce?: VoidFunction;
        update?: VoidFunction;
        meta: {
            description: string;
        };
    }
}