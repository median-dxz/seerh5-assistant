import { SAEventTarget } from '../common';

export * from './module';
export * from './socket';

export class SAEventBus {
    private cleanFn: CallBack[] = [];

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

    egret<T extends egret.Event>(event: string, callback: CallBack<T>) {
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
