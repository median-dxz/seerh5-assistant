import type { BattleInstance } from '@/service/store/battle';
import type { CommandInstance } from '@/service/store/command';
import type { LevelInstance } from '@/service/store/level';
import type { ModInstance } from '@/service/store/mod';
import type { SignInstance } from '@/service/store/sign';
import type { StrategyInstance } from '@/service/store/strategy';

import { createContext, useContext } from 'react';

export interface Store {
    store: Map<string, ModInstance>;
    sync: () => void;
    reload: (mods?: string[]) => void;
    ctStore: Map<string, number>;
    strategyStore: Map<string, StrategyInstance>;
    battleStore: Map<string, BattleInstance>;
    levelStore: Map<string, LevelInstance>;
    signStore: Map<string, SignInstance>;
    commandStore: Map<string, CommandInstance>;
}

export const ModStore = createContext({} as Store);

export function useModStore() {
    return useContext(ModStore);
}
