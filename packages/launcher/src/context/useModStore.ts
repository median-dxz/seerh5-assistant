import type { BattleInstance } from '@/services/store/battle';
import type { CommandInstance } from '@/services/store/command';
import type { ModInstance } from '@/services/store/mod';
import type { StrategyInstance } from '@/services/store/strategy';
import type { TaskInstance } from '@/services/store/task';

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
