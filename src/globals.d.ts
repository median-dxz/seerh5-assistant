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
        SaMods: any;
    }
    type Fn = (...args: any) => void;
    type CallBack = Fn;
    type PromiseAble<T> = T | Promise<T>;
    type NullOrUndefindedable<T> = T | undefined | null;
    type AttrConsts<T> = T[keyof T];
}
