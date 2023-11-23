import type { Subscription } from 'rxjs';
import { Observable, Subject, filter, map } from 'rxjs';
import type { AnyFunction } from '../common/utils.js';
import type { HookDataMap } from '../constant/type.js';

type ValueOf<T> = T[keyof T];
type HookResolver<T extends ValueOf<HookDataMap>> = (resolve: (data: T) => void) => AnyFunction;
type HookEventData = { type: keyof HookDataMap; data: ValueOf<HookDataMap> };

const subject = new Subject<HookEventData>();
const hookDataSubscriptionMap = new Map<string, Subscription>();

export const HookRegistry = {
    register<T extends keyof HookDataMap>(name: T, hookResolver: HookResolver<HookDataMap[T]>) {
        if (hookDataSubscriptionMap.has(name)) {
            throw `[error]: hook ${name} already registered`;
        }

        const hookData$ = new Observable<HookEventData>((subscriber) =>
            // 返回了Dispose函数
            hookResolver((data) => {
                subscriber.next({ type: name, data });
            })
        );

        hookDataSubscriptionMap.set(name, hookData$.subscribe(subject));
    },

    unregister<T extends keyof HookDataMap>(name: T) {
        const subscription = hookDataSubscriptionMap.get(name);
        if (subscription) {
            subscription.unsubscribe();
            hookDataSubscriptionMap.delete(name);
        }
    },

    $on<T extends keyof HookDataMap>(name: T) {
        return subject.pipe(
            filter((event) => event.type === name),
            map((event) => event.data as HookDataMap[T])
        );
    },
};
