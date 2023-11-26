export * from './DataSource.js';
export * from './HookRegistry.js';
export * from './SocketBuilderRegistry.js';
export * from './subscription.js';

import { fromEvent } from './source-builder/fromEvent.js';
import { fromEventPattern } from './source-builder/fromEventPattern.js';
import { fromGameModule } from './source-builder/fromGameModule.js';
import { fromHook } from './source-builder/fromHook.js';
import { fromEgret } from './source-builder/fromNative.js';
import { fromSocket } from './source-builder/fromSocket.js';

export class DataSource {
    static readonly hook = fromHook;
    static readonly event = fromEvent;
    static readonly socket = fromSocket;
    static readonly eventPattern = fromEventPattern;
    static readonly gameModule = fromGameModule;

    //native
    static readonly egret = fromEgret;
}
