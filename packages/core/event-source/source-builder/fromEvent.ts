import { fromEvent as rxFromEvent } from 'rxjs';
import { EventSource } from '../EventSource.js';

export function fromEvent(target: EventTarget, event: string) {
    return new EventSource(rxFromEvent(target, event));
}