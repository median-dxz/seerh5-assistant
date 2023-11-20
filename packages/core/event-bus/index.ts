import type { AnyFunction } from '../common/utils.js';
import { SEAHookDispatcher } from '../common/utils.js';

export * from './module.js';
export * from './socket.js';

export class EventBus {
    private cleanFn: AnyFunction[] = [];

    hook<TEvent extends string>(...args: Parameters<typeof SEAHookDispatcher.on<TEvent>>) {
        this.cleanFn.push(() => {
            SEAHookDispatcher.off(...args);
        });
        return SEAHookDispatcher.on(...args);
    }

    socket<This>(...args: Parameters<typeof SocketConnection.addCmdListener<This>>) {
        this.cleanFn.push(() => {
            SocketConnection.removeCmdListener(...args);
        });
        return SocketConnection.addCmdListener(...args);
    }

    egret(event: string, callback: AnyFunction) {
        this.cleanFn.push(() => {
            EventManager.removeEventListener(event, callback, undefined);
        });
        return EventManager.addEventListener(event, callback, undefined);
    }

    unmount() {
        this.cleanFn.forEach((fn) => fn());
        this.cleanFn = [];
    }
}
