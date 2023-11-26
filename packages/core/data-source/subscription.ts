import { Subject, takeUntil } from 'rxjs';
import type { DataSource } from './DataSource.js';

export class Subscription {
    private destroy$ = new Subject<void>();

    on<T>(dataSource: DataSource<T>, handler: (data: T) => void) {
        const { source$ } = dataSource;
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
