import type { AnyTask } from '@/shared';
import type { LevelBattle, MoveStrategy } from '@sea/core';
import type { Battle, Command, Strategy, Task } from '@sea/mod-type';
import { ctByName } from '../catchTimeBinding';
import type { ModInstance } from './handler';
import { type ModExportsRef } from './utils';

export const modStore = new Map<string, ModInstance>();

function createModExportsRefStore<Prototype, Instance>(builder: (ref: ModExportsRef, proto: Prototype) => Instance) {
    const store = new WeakMap<ModExportsRef, Instance>();
    return {
        add(ref: ModExportsRef, proto: Prototype) {
            store.set(ref, builder(ref, proto));
        },
        delete(ref: ModExportsRef) {
            store.delete(ref);
        },
        get(ref: ModExportsRef) {
            return store.get(ref);
        }
    };
}

function createModExportsKeyStore<Prototype, Instance>(builder: (deploymentId: string, proto: Prototype) => Instance) {
    const store = new Map<string, Instance>();
    return {
        add(deploymentId: string, key: string, proto: Prototype) {
            if (store.has(key)) {
                throw new Error(`Add Mod Exports: Key ${key} already exists`);
            }
            const instance = builder(deploymentId, proto);
            store.set(key, instance);
        },
        delete(key: string) {
            store.delete(key);
        },
        get(key: string) {
            return store.get(key);
        }
    };
}

export interface BattleInstance {
    deploymentId: string;
    battle: Battle;
    levelBattle: () => LevelBattle;
}

export interface TaskInstance extends AnyTask {
    cid: string;
}

export interface StrategyInstance extends MoveStrategy {
    deploymentId: string;
}

export const commandStore = createModExportsRefStore((ref, proto: Command) => proto);
export const taskStore = createModExportsRefStore((ref, proto: Task) => ({ ...proto, cid: ref.cid }) as TaskInstance);
export const strategyStore = createModExportsKeyStore((deploymentId, proto: Strategy) => ({
    deploymentId,
    strategy: proto,
    moveStrategy: {
        resolveMove: proto.resolveMove,
        resolveNoBlood: proto.resolveNoBlood,
        deploymentId
    } as StrategyInstance
}));
export const battleStore = createModExportsKeyStore(
    (deploymentId, proto: Battle) =>
        ({
            deploymentId,
            battle: proto,
            levelBattle: () => {
                const strategyInstance = strategyStore.get(proto.strategy);
                if (!strategyInstance) {
                    throw new Error(`Strategy ${proto.strategy} not found`);
                }
                if (!proto.pets.every(ctByName)) {
                    throw new Error(`Pets ${proto.pets.join(', ')} not all exist`);
                }
                return {
                    pets: proto.pets.map(ctByName) as number[],
                    strategy: strategyInstance.strategy,
                    beforeBattle: proto.beforeBattle
                } satisfies LevelBattle;
            }
        }) as BattleInstance
);
