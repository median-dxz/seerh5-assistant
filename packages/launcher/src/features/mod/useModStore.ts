import { useAppSelector, type AppRootState } from '@/store';
import type { Command } from '@sea/mod-type';
import { useMemo } from 'react';
import { shallowEqual } from 'react-redux';
import type { ModInstance } from './handler';
import type {
    BattleInstance,
    StrategyInstance,
    TaskInstance,
    battleStore,
    commandStore,
    modStore,
    strategyStore,
    taskStore
} from './store';
import type { ModExportsRef } from './utils';

type RefStoreInstance = Command | TaskInstance;
type RefStore = typeof commandStore | typeof taskStore;
type KeyStoreInstance = StrategyInstance | BattleInstance | ModInstance;
type KeyStore = typeof strategyStore | typeof battleStore | typeof modStore;

export function mapToStore<TStore extends RefStore | KeyStore>(
    key: string | ModExportsRef,
    store: TStore
): ReturnType<TStore['get']>;
export function mapToStore<TStore extends RefStore | KeyStore>(
    keys: string[] | ModExportsRef[],
    store: TStore
): Array<ReturnType<TStore['get']>>;

export function mapToStore<TKey extends string | ModExportsRef, TInstance extends RefStoreInstance | KeyStoreInstance>(
    keys: TKey | TKey[],
    store: { get(key: TKey): TInstance | undefined }
): undefined | TInstance | TInstance[];

export function mapToStore<TKey extends string | ModExportsRef, TInstance extends RefStoreInstance | KeyStoreInstance>(
    keys: TKey | TKey[],
    store: { get(key: TKey): TInstance | undefined }
) {
    if (Array.isArray(keys)) {
        return keys.map((key) => store.get(key));
    } else {
        return store.get(keys);
    }
}

export function useMapToStore<
    TKey extends string | ModExportsRef,
    TInstance extends RefStoreInstance | KeyStoreInstance
>(
    selector: (state: AppRootState) => undefined | TKey,
    store: { get(key: TKey): TInstance | undefined }
): TInstance | undefined;

export function useMapToStore<
    TKey extends string | ModExportsRef,
    TInstance extends RefStoreInstance | KeyStoreInstance
>(selector: (state: AppRootState) => TKey[], store: { get(key: TKey): TInstance | undefined }): TInstance[];

export function useMapToStore<
    TKey extends string | ModExportsRef,
    TInstance extends RefStoreInstance | KeyStoreInstance
>(selector: (state: AppRootState) => undefined | TKey | TKey[], store: { get(key: TKey): TInstance | undefined }) {
    const keys = useAppSelector(selector, shallowEqual);
    return useMemo(() => keys && mapToStore(keys, store), [keys, store]);
}
