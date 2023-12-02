import type { ModInstance } from '@/service/mod/type';

import { createContext, useContext } from 'react';

export interface ModStore {
    store: Store;
    sync: SyncStore;
}

export type Store = Map<string, ModInstance>;
export type SyncStore = (store: Store) => void;

export const ModStore = createContext({} as ModStore);

export function useModStore() {
    return useContext(ModStore);
}
