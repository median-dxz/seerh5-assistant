import * as endpoints from '@/service/endpoints';
import { enableMapSet, produce, type Draft } from 'immer';
import useSWR from 'swr';

enableMapSet();

export function useConfigPersistence<T>(key: string, initValue: T) {
    const {
        data,
        isLoading,
        mutate: persistenceMutate,
    } = useSWR(
        key,
        (key: string) =>
            endpoints.getConfig(key).then((v) => {
                return (v as T) ?? initValue;
            }),
        {
            fallbackData: initValue,
        }
    );

    const mutate = (recipe: (draft: Draft<T>) => void) => {
        persistenceMutate(async () => {
            const nextData = produce(data, recipe);
            const r = await endpoints.setConfig(key, nextData);
            if (r.success) {
                return nextData;
            } else {
                throw new Error('更新配置失败');
            }
        });
    };

    return { data, isLoading, mutate };
}

