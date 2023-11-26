import { fromEvent as rxFromEvent } from 'rxjs';
import { DataSource } from '../DataSource.js';

export function fromEvent(target: EventTarget, event: string) {
    return new DataSource(rxFromEvent(target, event));
}