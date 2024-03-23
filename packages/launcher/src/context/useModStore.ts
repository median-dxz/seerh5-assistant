import type { BattleInstance } from '@/service/store/battle';
import type { CommandInstance } from '@/service/store/command';
import type { ModInstance } from '@/service/store/mod';
import type { StrategyInstance } from '@/service/store/strategy';
import type { TaskInstance } from '@/service/store/task';

import { createContext, useContext } from 'react';

export interface Store {
    sync: () => void;
    modStore: Map<string, ModInstance>;
    ctStore: Map<string, number>;
    strategyStore: Map<string, StrategyInstance>;
    battleStore: Map<string, BattleInstance>;
    taskStore: Map<string, TaskInstance>;
    commandStore: Map<string, CommandInstance>;
}

export const ModStore = createContext({} as Store);

export function useModStore() {
    return useContext(ModStore);
}
