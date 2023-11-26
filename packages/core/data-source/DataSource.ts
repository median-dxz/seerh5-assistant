import { take, type Observable, type Subscription } from 'rxjs';
import type { Handler } from '../common/utils.js';

export class DataSource<T> {
    private _source$: Observable<T>;

    public get source$(): Observable<T> {
        return this._source$;
    }

    private subscriptions = new Map<number, Subscription>();
    private subscriptionId = 0;

    constructor(dataSource$: Observable<T>) {
        this._source$ = dataSource$;
    }

    on(handler: Handler<T>) {
        const subscription = this._source$.subscribe(handler);
        this.subscriptions.set(++this.subscriptionId, subscription);
        return this.subscriptionId;
    }

    once(handler: Handler<T>) {
        this._source$.pipe(take(1)).subscribe(handler);
    }

    off(subscriptionId: number) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (subscription) {
            subscription.unsubscribe();
            return this.subscriptions.delete(subscriptionId);
        }
        return false;
    }
}
