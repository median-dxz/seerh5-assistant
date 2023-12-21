import { filter, map } from 'rxjs';
import type { HookDataMap } from '../../constant/TypeMaps.js';
import { SEAEventSource } from '../EventSource.js';
import { HookPointRegistry } from '../HookPointRegistry.js';

export function $hook<T extends keyof HookDataMap>(hook: T) {
    return HookPointRegistry.subject$.pipe(
        filter(({ type }) => type === hook),
        map(({ data }) => data as HookDataMap[T])
    );
}

export function fromHook<T extends keyof HookDataMap>(hook: T) {
    return new SEAEventSource($hook(hook));
}