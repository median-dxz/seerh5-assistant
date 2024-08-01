import { useMemo } from 'react';
import { shallowEqual } from 'react-redux';

import type { LevelBattle, MoveStrategy } from '@sea/core';
import type { Battle, Command, Strategy, Task } from '@sea/mod-type';

import { type AnyTask, useAppSelector } from '@/shared';
import type { AppRootState } from '@/store';

import { ctByName } from '../catchTimeBinding';

import type { ModInstance } from './handler';
import type { ModDeployment, ModExportsRef } from './utils';

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

export interface StrategyInstance {
    deploymentId: string;
    moveStrategy: MoveStrategy;
}

export const modInsStore = new Map<string, ModInstance>();
export const commandStore = createModExportsRefStore((ref, proto: Command) => proto);
export const taskStore = createModExportsRefStore((ref, proto: Task) => ({ ...proto, cid: ref.cid }) as TaskInstance);
export const strategyStore = createModExportsKeyStore(
    (deploymentId, proto: Strategy) =>
        ({
            deploymentId,
            moveStrategy: {
                ...proto
            }
        }) as StrategyInstance
);
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
                    strategy: strategyInstance.moveStrategy,
                    beforeBattle: proto.beforeBattle
                } satisfies LevelBattle;
            }
        }) as BattleInstance
);

type ModExportsKeyIns = StrategyInstance | BattleInstance | ModInstance;
type ModExportsRefIns = Command | TaskInstance;
type ModExportsIns = ModExportsKeyIns | ModExportsRefIns;

interface Store<Key extends string | ModExportsRef, Ins extends ModExportsIns> {
    get(key: Key): Ins | undefined;
}

export function mapModExportsIns<Ins extends ModExportsKeyIns>(key: string, store: Store<string, Ins>): Ins | undefined;
export function mapModExportsIns<Ins extends ModExportsRefIns>(
    ref: ModExportsRef,
    store: Store<ModExportsRef, Ins>
): Ins | undefined;

export function mapModExportsIns<Ins extends ModExportsKeyIns>(keys: string[], store: Store<string, Ins>): Ins[];
export function mapModExportsIns<Ins extends ModExportsRefIns>(
    refs: ModExportsRef[],
    store: Store<ModExportsRef, Ins>
): Ins[];

export function mapModExportsIns<Key extends string | ModExportsRef, Ins extends ModExportsIns>(
    keys: Key | Key[],
    store: Store<Key, Ins>
): ModExportsIns[] | ModExportsIns;

export function mapModExportsIns<Key extends string | ModExportsRef, Ins extends ModExportsIns>(
    keys: Key | Key[],
    store: Store<Key, Ins>
) {
    if (Array.isArray(keys)) {
        return keys.map((key) => store.get(key)).filter(Boolean);
    } else {
        return store.get(keys);
    }
}

export function useMapModExportsIns<TIns extends ModExportsKeyIns>(
    selector: (state: AppRootState) => string | undefined,
    store: Store<string, TIns>
): TIns | undefined;

export function useMapModExportsIns<TIns extends ModExportsRefIns>(
    selector: (state: AppRootState) => ModExportsRef | undefined,
    store: Store<ModExportsRef, TIns>
): TIns | undefined;

export function useMapModExportsIns<TIns extends ModExportsKeyIns>(
    selector: (state: AppRootState) => string[],
    store: Store<string, TIns>
): TIns[];

export function useMapModExportsIns<TIns extends ModExportsRefIns>(
    selector: (state: AppRootState) => ModExportsRef[],
    store: Store<ModExportsRef, TIns>
): TIns[];

export function useMapModExportsIns<TKey extends string | ModExportsRef, TIns extends ModExportsIns>(
    selector: (state: AppRootState) => undefined | TKey | TKey[],
    store: Store<TKey, TIns>
) {
    const keys = useAppSelector(selector, shallowEqual);
    return useMemo(() => keys && mapModExportsIns(keys, store), [keys, store]);
}

const NULL = {} as ModExportsRef;
const identity = (state: unknown): never => state as never;

export const getCommand = (ref = NULL) => mapModExportsIns(ref, commandStore);
export const getTask = (ref = NULL) => mapModExportsIns(ref, taskStore);
export const getStrategy = (key = '') => mapModExportsIns(key, strategyStore);
export const getBattle = (key = '') => mapModExportsIns(key, battleStore);
export const getModIns = (deploymentId = '') => mapModExportsIns(deploymentId, modInsStore);

export const useCommandStore = (selector: (state: ModExportsRef[]) => ModExportsRef[] = identity) =>
    useMapModExportsIns((state) => selector(state.mod.commandRefs), commandStore);
export const useTaskStore = (selector: (state: ModExportsRef[]) => ModExportsRef[] = identity) =>
    useMapModExportsIns((state) => selector(state.mod.taskRefs), taskStore);
export const useStrategyStore = (selector: (state: string[]) => string[] = identity) =>
    useMapModExportsIns((state) => selector(state.mod.strategyKeys), strategyStore);
export const useBattleStore = (selector: (state: string[]) => string[] = identity) =>
    useMapModExportsIns((state) => selector(state.mod.strategyKeys), battleStore);
export const useModInsStore = (selector: (state: ModDeployment[]) => string[] = identity) =>
    useMapModExportsIns((state) => selector(Object.values(state.mod.deployments.entities)), modInsStore);
