import type { AnyFunction } from '../common/utils.js';

export type DelegateEventEmitter = {
    on(...args: unknown[]): void;
    off(...args: unknown[]): void;
};

export class EventBus {
    private cleanFn: AnyFunction[] = [];

    proxy<TEventEmitter extends DelegateEventEmitter>(eventEmitter: TEventEmitter) {
        const proxyOn = (...args: unknown[]) => {
            eventEmitter.on(...args);
            this.cleanFn.push(() => eventEmitter.off(...args));
        };

        return new Proxy(eventEmitter, {
            get(target, prop, receiver) {
                if (prop === 'on') {
                    return proxyOn;
                }
                return Reflect.get(target, prop, receiver);
            },
        });
    }

    unmount() {
        this.cleanFn.forEach((fn) => fn());
        this.cleanFn = [];
    }
}
