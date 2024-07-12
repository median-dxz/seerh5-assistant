import type { BattleInstance } from '@/services/modStore/battle';
import type { CommandInstance } from '@/services/modStore/command';
import type { ModInstance } from '@/services/modStore/mod';
import type { StrategyInstance } from '@/services/modStore/strategy';
import type { TaskInstance } from '@/services/modStore/task';

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
