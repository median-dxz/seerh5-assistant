import type { MoveStrategy } from 'sea-core/battle';

interface StrategyInstance {
    strategy: MoveStrategy;
    referredBattle: string[];
    ownerMod: string;
}

const store = new Map<string, StrategyInstance>();

export function add(mod: string, _strategy: SEAL.Strategy) {
    const { name, resolveMove, resolveNoBlood } = _strategy;
    const instance = { strategy: { resolveMove, resolveNoBlood }, referredBattle: [], ownerMod: mod };
    store.set(name, instance);
}

export function tryRemove(name: string) {
    const instance = store.get(name);
    if (!instance) return;

    if (instance.referredBattle.length > 0) {
        throw new Error(`${name} is referred by ${instance.referredBattle.join(', ')}`);
    }

    store.delete(name);
}
