import { fromEventPattern } from './fromEventPattern.js';

export function fromEgret(event: string) {
    return fromEventPattern(
        (handler) => {
            EventManager.addEventListener(event, handler, undefined);
        },
        (handler) => {
            EventManager.removeEventListener(event, handler, undefined);
        }
    );
}