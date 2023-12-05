import { filter, map } from 'rxjs';
import type { HookDataMap } from '../../constant/type.js';
import { SEAEventSource } from '../EventSource.js';
import { HookRegistry } from '../HookRegistry.js';

export function $hook<T extends keyof HookDataMap>(hook: T) {
    return HookRegistry.subject$.pipe(
        filter(({ type }) => type === hook),
        map(({ data }) => data as HookDataMap[T])
    );
}

export function fromHook<T extends keyof HookDataMap>(hook: T) {
    return new SEAEventSource($hook(hook));
}