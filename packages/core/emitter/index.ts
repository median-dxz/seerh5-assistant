export * from './EventBus.js';
export * from './GameModule.js';
export * from './socket.js';

import type { DelegateEventEmitter } from './EventBus.js';

export const GameNativeEmitter = {
    socket: {
        on<This>(...args: Parameters<typeof SocketConnection.addCmdListener<This>>) {
            return SocketConnection.addCmdListener(...args);
        },
        off<This>(...args: Parameters<typeof SocketConnection.removeCmdListener<This>>) {
            return SocketConnection.removeCmdListener(...args);
        },
    } as DelegateEventEmitter,
    egret: {
        on(...args: Parameters<typeof EventManager.addEventListener>) {
            return EventManager.addEventListener(...args);
        },
        off(...args: Parameters<typeof EventManager.removeEventListener>) {
            return EventManager.removeEventListener(...args);
        },
    } as DelegateEventEmitter,
};
