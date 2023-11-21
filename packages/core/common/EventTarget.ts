import type { HookDataMap } from '../constant/index.js';

type EventKey = number | string;
export type Handler<T> = (data: T) => void;
export type EventData<
    Type extends EventKey,
    TEvents extends Record<EventKey, unknown>,
    TDefaultValue
> = Type extends keyof TEvents ? TEvents[Type] : TDefaultValue;

export class SEAEventTarget<TEvents extends Record<EventKey, unknown>, TDefaultValue = unknown> {
    private et = new EventTarget();
    handlers = new Map<Handler<never>, EventListenerOrEventListenerObject>();

    on<T extends EventKey>(type: T | keyof TEvents, handler: Handler<EventData<T, TEvents, TDefaultValue>>) {
        let wrappedHandler = this.handlers.get(handler);
        if (wrappedHandler == undefined) {
            wrappedHandler = (e: Event) => {
                if (e instanceof CustomEvent) {
                    handler(e.detail as EventData<T, TEvents, TDefaultValue>);
                }
            };
            this.handlers.set(handler, wrappedHandler);
        }
        this.et.addEventListener(String(type), wrappedHandler);
    }

    once<T extends EventKey>(type: T | keyof TEvents, handler: Handler<EventData<T, TEvents, TDefaultValue>>) {
        this.et.addEventListener(
            String(type),
            (e: Event) => handler((e as CustomEvent).detail as EventData<T, TEvents, TDefaultValue>),
            {
                once: true,
            }
        );
    }

    off<T extends EventKey>(type: T | keyof TEvents, handler: Handler<EventData<T, TEvents, TDefaultValue>>) {
        if (this.handlers.has(handler)) {
            this.et.removeEventListener(String(type), this.handlers.get(handler)!);
            this.handlers.delete(handler);
        }
    }

    emit<T extends EventKey>(type: T | keyof TEvents, data?: EventData<T, TEvents, TDefaultValue>) {
        return this.et.dispatchEvent(new CustomEvent(String(type), { detail: data }));
    }
}

export const SEAHookEmitter = new SEAEventTarget<HookDataMap, undefined>();
