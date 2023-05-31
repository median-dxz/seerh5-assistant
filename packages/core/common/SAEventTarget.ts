import { SAHookData } from '../constant/index.js';

type Listener<T> = (data: T) => void;
type EventData<Type, TEvent extends Record<string, any>> = Type extends keyof TEvent ? TEvent[Type] : undefined;

interface SAEventTarget<Events extends Record<string, any>> {
    on<T extends string>(type: T, listener: Listener<EventData<T, Events>>): void;
    once<T extends string>(type: T, listener: Listener<EventData<T, Events>>): void;
    off<T extends string>(type: T, listener: Listener<EventData<T, Events>>): void;
    emit<T extends string>(type: T, data?: EventData<T, Events>): boolean;
}

const et = new EventTarget();
const listenerMap = new Map<Listener<any>, EventListener>();

export const SAEventTarget: SAEventTarget<SAHookData> = {
    on(type, listener) {
        let wrappedListener = listenerMap.get(listener);
        if (wrappedListener == undefined) {
            wrappedListener = (e: Event) => {
                if (e instanceof CustomEvent) {
                    listener(e.detail);
                }
            };
            listenerMap.set(listener, wrappedListener);
        }
        et.addEventListener(type, wrappedListener);
    },

    once(type, listener) {
        et.addEventListener(type, (e: Event) => listener((e as CustomEvent).detail), { once: true });
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
