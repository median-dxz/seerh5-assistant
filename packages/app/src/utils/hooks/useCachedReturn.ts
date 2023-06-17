import { useRef } from 'react';

export function useCachedReturn<TKey, TFn extends (data: TKey, index: number) => unknown, TCache>(
    data: TKey[],
    fn: TFn | undefined,
    factory: (value: ReturnType<TFn> | undefined, data: TKey, index: number) => TCache
) {
    const valueRef = useRef(new Map<TKey, TCache>());
    const fnCache = useRef(fn);

    if (fnCache.current !== fn) {
        fnCache.current = fn;
        valueRef.current.clear();
        data.forEach((data, index) => {
            valueRef.current.set(
                data,
                factory(fnCache.current?.(data, index) as ReturnType<TFn> | undefined, data, index)
            );
        });
    } else {
        data.forEach((data, index) => {
            if (!valueRef.current.has(data)) {
                valueRef.current.set(
                    data,
                    factory(fnCache.current?.(data, index) as ReturnType<TFn> | undefined, data, index)
                );
            }
        });

        // 删除不存在的元素
        valueRef.current.forEach((_, k) => {
            if (!data.includes(k)) {
                valueRef.current.delete(k);
            }
        });
    }
    return valueRef;
}
