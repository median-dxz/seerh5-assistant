import type { Subscription } from 'rxjs';
import { Observable, Subject } from 'rxjs';
import { getLogger } from '../common/log.js';
import type { AnyFunction, ValueOf } from '../common/utils.js';
import type { HookPointDataMap } from '../constant/TypeMaps.js';

type DataSteam<TEvents extends object> = {
    type: keyof TEvents;
    data: ValueOf<TEvents>;
};

type HookResolver<T extends ValueOf<HookPointDataMap>> = T extends undefined
    ? (resolve: (data?: undefined) => void) => AnyFunction | void
    : (resolve: (data: T) => void) => AnyFunction | void;

type HookEventData = DataSteam<HookPointDataMap>;

const hookDataSubscriptionMap = new Map<string, Subscription>();

export const HookPointRegistry = {
    subject$: new Subject<HookEventData>(),

    register<T extends keyof HookPointDataMap>(name: T, hookResolver: HookResolver<HookPointDataMap[T]>) {
        if (hookDataSubscriptionMap.has(name)) {
            getLogger('HookPointRegistry').error(`HookPoint ${name} 已经被注册, 如果这是有意的, 请先取消之前的注册`);
            return;
        }

        const hookData$ = new Observable<HookEventData>((subscriber) =>
            // 如果返回了Dispose函数, 会在unsubscribe的时候自动调用
            hookResolver((data) => {
                subscriber.next({ type: name, data });
            })
        );

        hookDataSubscriptionMap.set(name, hookData$.subscribe(this.subject$));
    },

    unregister<T extends keyof HookPointDataMap>(name: T) {
        const subscription = hookDataSubscriptionMap.get(name);
        if (subscription) {
            subscription.unsubscribe();
            hookDataSubscriptionMap.delete(name);
        }
    },
};
