import { take, type Observable, type Subscription } from 'rxjs';
import type { Handler } from '../common/utils.js';
import { fromEvent } from './source-builder/fromEvent.js';
import { fromEventPattern } from './source-builder/fromEventPattern.js';
import { fromGameModule } from './source-builder/fromGameModule.js';
import { fromHook } from './source-builder/fromHook.js';
import { fromEgret } from './source-builder/fromNative.js';
import { fromSocket } from './source-builder/fromSocket.js';

export class SEAEventSource<T> {
    private _source$: Observable<T>;

    public get source$(): Observable<T> {
        return this._source$;
    }

    private subscriptions = new Map<number, Subscription>();
    private subscriptionId = 0;

    constructor(EventSource$: Observable<T>) {
        this._source$ = EventSource$;
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

    static readonly event = fromEvent;
    static readonly eventPattern = fromEventPattern;
    static readonly gameModule = fromGameModule;
    static readonly hook = fromHook;
    static readonly egret = fromEgret;
    static readonly socket = fromSocket;
}
