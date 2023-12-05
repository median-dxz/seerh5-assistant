import { fromEventPattern as rxFromEventPattern } from 'rxjs';
import { SEAEventSource } from '../EventSource.js';

export function fromEventPattern<T>(...args: Parameters<typeof rxFromEventPattern<T>>) {
    return new SEAEventSource(rxFromEventPattern(...args));
}
