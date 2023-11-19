import type { AnyFunction } from '../common/utils.js';
import { SEAEventTarget } from '../common/utils.js';

export * from './module.js';
export * from './socket.js';

export class EventBus {
    private cleanFn: AnyFunction[] = [];

    hook<TEvent extends string>(...args: Parameters<typeof SEAEventTarget.on<TEvent>>) {
        this.cleanFn.push(() => {
            SEAEventTarget.off(...args);
        });
        return SEAEventTarget.on(...args);
    }

    socket<This>(...args: Parameters<typeof SocketConnection.addCmdListener<This>>) {
        this.cleanFn.push(() => {
            SocketConnection.removeCmdListener(...args);
        });
        return SocketConnection.addCmdListener(...args);
    }

    egret(event: string, callback: Callback) {
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
