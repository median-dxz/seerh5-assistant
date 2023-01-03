import { delay, wrapper } from '@sa-core/common';
import * as SACore from '@sa-core/index';

declare global {
    var SA: typeof SACore;
    interface Window {
        SAEventTarget: EventTarget;
        delay: typeof delay;
        wrapper: typeof wrapper;
        filterLogText: RegExp[];
        filterWarnText: RegExp[];
        SAMods: Map<string, import('@sa-core/mod-type').Mod>;
        SACoreReady: boolean;
        SAResourceMap: Map<string, string>;
    }

    type AnyFunction = (...args: any) => any;
    type BindThisFunction<E, F extends AnyFunction> = (this: E, ...args: Parameters<F>) => any;
    type CallBack<T = any> = (this: T, ...args: any) => any | AnyFunction;
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
