import type { MoveStrategy } from 'sea-core';

export interface StrategyInstance {
    name: string;
    strategy: MoveStrategy;
    ownerMod: string;
}

export const store = new Map<string, StrategyInstance>();

export function add(mod: string, _strategy: SEAL.Strategy) {
    const { name, resolveMove, resolveNoBlood } = _strategy;
    const instance: StrategyInstance = { strategy: { resolveMove, resolveNoBlood }, ownerMod: mod, name };
    store.set(name, instance);
}

export function tryRemove(name: string) {
    const instance = store.get(name);
    if (!instance) return;
    store.delete(name);
}
