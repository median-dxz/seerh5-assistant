import * as endpoints from '@/services/endpoints';
import { produce, type Draft } from 'immer';
import useSWR from 'swr';

export function usePersistentConfig<T>(key: endpoints.ConfigKey, initValue: T) {
    const {
        data,
        isLoading,
        mutate: persistenceMutate
    } = useSWR(
        key,
        (key: endpoints.ConfigKey) =>
            endpoints.getConfig(key).then((v) => {
                return (v as T) ?? initValue;
            }),
        {
            fallbackData: initValue
        }
    );

    const mutate = (recipe: (draft: Draft<T>) => void) => {
        persistenceMutate(async () => {
            const nextData = produce(data, recipe);
            await endpoints.setConfig(key, nextData);
            return nextData;
        });
    };

    return { data, isLoading, mutate };
}
