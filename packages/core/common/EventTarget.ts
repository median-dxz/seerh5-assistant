import type { SEAHookData } from '../constant/index.js';

type Listener<T> = (data: T) => void;
type EventData<Type extends string, TEvents extends Record<string, unknown>> = Type extends keyof TEvents
    ? TEvents[Type]
    : undefined;

interface SEAEventTarget<TEvents extends Record<string, unknown>> {
    on<T extends string>(type: T, listener: Listener<EventData<T, TEvents>>): void;
    once<T extends string>(type: T, listener: Listener<EventData<T, TEvents>>): void;
    off<T extends string>(type: T, listener: Listener<EventData<T, TEvents>>): void;
    emit<T extends string>(type: T, data?: EventData<T, TEvents>): boolean;
}

const et = new EventTarget();

const listenerMap = new Map<Listener<never>, EventListener>();

export const SEAEventTarget: SEAEventTarget<SEAHookData> = {
    on(type, listener) {
        let wrappedListener = listenerMap.get(listener);
        if (wrappedListener == undefined) {
            wrappedListener = (e: Event) => {
                if (e instanceof CustomEvent) {
                    listener(e.detail as EventData<typeof type, SEAHookData>);
                }
            };
            listenerMap.set(listener, wrappedListener);
        }
        et.addEventListener(type, wrappedListener);
    },

    once(type, listener) {
        et.addEventListener(
            type,
            (e: Event) => listener((e as CustomEvent).detail as EventData<typeof type, SEAHookData>),
            { once: true }
        );
    },

    off(type, listener) {
        if (listenerMap.has(listener)) {
            et.removeEventListener(type, listenerMap.get(listener)!);
        }
    },

    emit(type, data?) {
        return et.dispatchEvent(new CustomEvent(type, { detail: data }));
    },
};
