export type { AutoBattle } from './battle';
export type { ModuleSubscriber } from './event-handler';
export * from './index';

import { delay as _delay, wrapper as _wrapper } from './common';
import * as _SACore from './exports';
import { Mod } from './mod-type';

declare global {
    var sa: typeof _SACore;
    var delay: typeof _delay;
    var wrapper: typeof _wrapper;
    interface Window {
        SAEventTarget: EventTarget;
        filterLogText: RegExp[];
        filterWarnText: RegExp[];
        SAMods: Map<string, Mod>;
        SeerH5Ready: boolean;
        SAResourceMap: Map<string, string>;
    }
}

export type SACore = typeof _SACore;
