import { SAEventTarget } from '../common/utils.js';

export * from './module.js';
export * from './socket.js';

export class SAEventBus {
    private cleanFn: Function[] = [];

    hook<TEvent extends string>(...args: Parameters<typeof SAEventTarget.on<TEvent>>) {
        this.cleanFn.push(() => {
            SAEventTarget.off(...args);
        });
        return SAEventTarget.on(...args);
    }

    socket<This>(...args: Parameters<typeof SocketConnection.addCmdListener<This>>) {
        this.cleanFn.push(() => {
            SocketConnection.removeCmdListener(...args);
        });
        return SocketConnection.addCmdListener(...args);
    }

    egret(event: string, callback: Function) {
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
