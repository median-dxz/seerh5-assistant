import { Subject, takeUntil } from 'rxjs';
import type { EventSource } from './EventSource.js';

export class Subscription {
    private destroy$ = new Subject<void>();

    on<T>(EventSource: EventSource<T>, handler: (data: T) => void) {
        const { source$ } = EventSource;
        source$.pipe(takeUntil(this.destroy$)).subscribe(handler);
    }

    [Symbol.dispose]() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    dispose() {
        this[Symbol.dispose]();
    }
}
