import { filter, map } from 'rxjs';
import type { HookPointDataMap } from '../../constant/TypeMaps.js';
import { HookPointRegistry } from '../../internal/HookPointRegistry.js';
import { SEAEventSource } from '../EventSource.js';

export function $hook<T extends keyof HookPointDataMap>(hook: T) {
    return HookPointRegistry.subject$.pipe(
        filter(({ type }) => type === hook),
        map(({ data }) => data as HookPointDataMap[T])
    );
}

export function fromHook<T extends keyof HookPointDataMap>(hook: T) {
    return new SEAEventSource($hook(hook));
}
