import type { ModInstance } from '@/service/mod/type';
import * as service from '@/service/store/mod';
import { produce, setAutoFreeze } from 'immer';
import React, { useEffect, useState, type PropsWithChildren } from 'react';
import { NOOP } from 'sea-core';
import { ModStore, type SyncStore } from './useModStore';

export function ModStoreProvider({ children }: PropsWithChildren<object>) {
    const [store, setStore] = useState(new Map<string, ModInstance>());
    const sync: SyncStore = (store) => {
        setAutoFreeze(false);
        setStore(produce(store, NOOP));
        setAutoFreeze(true);
    };

    useEffect(() => {
        // 加载模组
        let active = true;
        service.fetchMods().then((mods) => {
            active && mods.forEach(service.setup);
            sync(service.store);
        });

        return () => {
            active = false;
            service.teardown();
            sync(service.store);
        };
    });

    return <ModStore.Provider value={{ store, sync }}>{children}</ModStore.Provider>;
}
