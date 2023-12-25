import type { ILevelBattle } from '@sea/core';

import type { Battle } from '@/sea-launcher';
import { ctByName } from './CatchTimeBinding';
import { store as strategyStore } from './strategy';

export interface BattleInstance {
    name: string;
    battle: () => ILevelBattle;
    ownerMod: string;
    pets: string[];
    strategy: string;
}

export const store = new Map<string, BattleInstance>();

export function add(mod: string, _battle: Battle) {
    const { name, pets, strategy: _strategy, beforeBattle } = _battle;
    const instance: BattleInstance = {
        battle: () => {
            const strategyInstance = strategyStore.get(_strategy);
            if (!strategyInstance) {
                throw new Error(`Strategy ${strategyInstance} not found`);
            }
            if (!pets.every(ctByName)) {
                throw new Error(`Pets ${pets.join(', ')} not all exist`);
            }
            return {
                name,
                pets: pets.map(ctByName) as number[],
                strategy: strategyInstance.strategy,
                beforeBattle,
            };
        },
        name,
        ownerMod: mod,
        pets,
        strategy: _strategy,
    };
    store.set(name, instance);
}

export function tryRemove(name: string) {
    const instance = store.get(name);
    if (!instance) return;
    store.delete(name);
}
