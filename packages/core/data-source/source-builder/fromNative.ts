import { fromEventPattern } from './fromEventPattern.js';

export function fromEgret<T>(event: string) {
    return fromEventPattern<T>(
        (handler) => {
            EventManager.addEventListener(event, handler, undefined);
        },
        (handler) => {
            EventManager.removeEventListener(event, handler, undefined);
        }
    );
}