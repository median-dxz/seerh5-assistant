import { fromEventPattern as rxFromEventPattern } from 'rxjs';
import { EventSource } from '../EventSource.js';

export function fromEventPattern<T>(...args: Parameters<typeof rxFromEventPattern<T>>) {
    return new EventSource(rxFromEventPattern(...args));
}
