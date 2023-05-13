import { SAHookData } from '../constant';

type Listener<T> = (data: T) => void;
type EventData<Type, Event extends Record<string, any>> = Type extends keyof Event ? Event[Type] : undefined;

interface SAEventTarget<Events extends Record<string, any>> {
    on<Type extends string>(type: Type, listener: Listener<EventData<Type, Events>>): void;
    once<Type extends string>(type: Type, listener: Listener<EventData<Type, Events>>): void;
    emit<Type extends string>(type: Type, data?: EventData<Type, Events>): boolean;
    off<Type extends string>(type: Type, listener: Listener<EventData<Type, Events>>): void;
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
