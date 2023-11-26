import { fromEventPattern as rxFromEventPattern } from 'rxjs';
import { DataSource } from '../DataSource.js';

export function fromEventPattern<T>(...args: Parameters<typeof rxFromEventPattern<T>>) {
    return new DataSource(rxFromEventPattern(...args));
}
