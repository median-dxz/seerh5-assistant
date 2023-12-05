import { fromEvent as rxFromEvent } from 'rxjs';
import { SEAEventSource } from '../EventSource.js';

export function fromEvent(target: EventTarget, event: string) {
    return new SEAEventSource(rxFromEvent(target, event));
}