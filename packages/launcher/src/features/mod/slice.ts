import { getCompositeId } from '@/shared/index';
import { createAppSlice } from '@/shared/redux';
import type { AppDispatch, AppRootState } from '@/store';
import {
    createAction,
    createEntityAdapter,
    nanoid,
    type EntityState,
    type ThunkAction,
    type UnknownAction
} from '@reduxjs/toolkit';
import type { SEAModExport } from '@sea/mod-type';
import type { ModState } from '@sea/server';
import { createModContext, ModInstance } from './handler';
import { battleStore, commandStore, modStore, strategyStore, taskStore } from './store';
import { type ModExportsRef } from './utils';

import { modApi } from '@/services/mod';

export interface ModDeploymentInfo {
    id: string;
    scope: string;
    state: ModState;
}

export type ModDeploymentStatus = 'notDeployed' | 'deployed';
export type ModDeployment<T extends ModDeploymentStatus = ModDeploymentStatus> = T extends 'deployed'
    ? ModDeploymentInfo & {
          status: T;
          deploymentId: string;
          isDeploying: false;
      }
    : ModDeploymentInfo & { status: T; isDeploying: boolean };

export interface DeploymentState {
    deployments: EntityState<ModDeployment, string>;
    taskRefs: ModExportsRef[];
    commandRefs: ModExportsRef[];
    battleKeys: string[];
    strategyKeys: string[];
}

export type DeploymentFilter = (deployment: ModDeployment) => boolean;

const deploymentAdapter = createEntityAdapter({
    selectId: (deployment: ModDeployment) => getCompositeId(deployment)
});

const initialState: DeploymentState = {
    deployments: deploymentAdapter.getInitialState(),
    taskRefs: [],
    commandRefs: [],
    battleKeys: [],
    strategyKeys: []
};

const addExportsThunk =
    (modInstance: ModInstance, modExport: SEAModExport): ThunkAction<void, AppRootState, unknown, UnknownAction> =>
    (dispatch) => {
        (['commands', 'tasks', 'strategies', 'battles'] as const).forEach((key) => {
            if (modExport[key] == undefined) {
                modExport[key] = [];
            }
        });

        const { commands, battles, strategies, tasks } = modExport as Required<SEAModExport>;
        const { deploymentId, metadata } = modInstance;

        const createRef = (key: string): ModExportsRef => ({ deploymentId, cid: getCompositeId(metadata), key });

        const commandRefs = Object.values(commands).map((command) => {
            const ref = createRef(command.name);
            commandStore.add(ref, command);
            modInstance.addFinalizer(() => commandStore.delete(ref));
            return ref;
        });

        const taskRefs = Object.values(tasks).map((task) => {
            const ref = createRef(task.metadata.id);
            taskStore.add(ref, task);
            modInstance.addFinalizer(() => taskStore.delete(ref));
            return ref;
        });

        const strategyKeys = Object.values(strategies).map((strategy) => {
            strategyStore.add(deploymentId, strategy.name, strategy);
            modInstance.addFinalizer(() => strategyStore.delete(strategy.name));
            return strategy.name;
        });

        const battleKeys = Object.values(battles).map((battle) => {
            battleStore.add(deploymentId, battle.name, battle);
            modInstance.addFinalizer(() => battleStore.delete(battle.name));
            return battle.name;
        });

        dispatch(modActions.addExports({ commandRefs, taskRefs, strategyKeys, battleKeys }));
    };

const disposeThunk =
    (cid: string): ThunkAction<void, AppRootState, unknown, UnknownAction> =>
    (dispatch, getState) => {
        const deployment = deploymentSelectors.selectById(getState(), cid);
        if (deployment.status === 'notDeployed') {
            return;
        }
        const { deploymentId } = deployment;
        const ins = modStore.get(deployment.deploymentId)!;
        modStore.delete(deploymentId);

        dispatch(disposeAction(cid));

        ins.dispose();
        console.log(`撤销部署: ${ins.compositeId}: ${ins.deploymentId}`);
    };
const disposeAction = createAction<string>('mod/dispose');

const modSlice = createAppSlice({
    name: 'mod',
    initialState,
    reducers: (create) => ({
        deploy: create.asyncThunk<string, string>(
            async (cid, api) => {
                const dispatch = api.dispatch as AppDispatch;
                const deployment = deploymentSelectors.selectById(api.getState() as AppRootState, cid);

                const promise = dispatch(modApi.endpoints.fetch.initiate(deployment));
                const { factory, metadata } = await promise.unwrap();
                promise.unsubscribe();

                const context = await createModContext(metadata);
                const modExport = await factory(context);
                const deploymentId = nanoid();

                const instance = new ModInstance(deploymentId, context, modExport);
                modStore.set(deploymentId, instance);
                dispatch(addExportsThunk(instance, modExport));

                return deploymentId;
            },
            {
                options: {
                    condition(cid, api): boolean {
                        const deployment = deploymentSelectors.selectById(api.getState() as AppRootState, cid);
                        return deployment.status === 'notDeployed';
                    }
                },
                pending(state, action) {
                    deploymentAdapter.updateOne(state.deployments, {
                        id: action.meta.arg,
                        changes: { isDeploying: true }
                    });
                },
                fulfilled(state, action) {
                    deploymentAdapter.updateOne(state.deployments, {
                        id: action.meta.arg,
                        changes: { deploymentId: action.payload, status: 'deployed', isDeploying: false }
                    });
                }
            }
        ),
        addExports: create.reducer<Pick<DeploymentState, 'battleKeys' | 'commandRefs' | 'strategyKeys' | 'taskRefs'>>(
            (state, { payload }) => {
                state.commandRefs.push(...payload.commandRefs);
                state.taskRefs.push(...payload.taskRefs);
                state.strategyKeys.push(...payload.strategyKeys);
                state.battleKeys.push(...payload.battleKeys);
            }
        )
    }),
    extraReducers: (builder) =>
        builder
            .addCase(disposeAction, (state, { payload }) => {
                const cid = payload;
                const dep = deploymentAdapter
                    .getSelectors<typeof state>((state) => state.deployments)
                    .selectById(state, cid);

                if (dep.status === 'notDeployed') {
                    return;
                }

                const id = dep.deploymentId;

                state.commandRefs = state.commandRefs.filter((ref) => ref.deploymentId === id);
                state.taskRefs = state.taskRefs.filter((ref) => ref.deploymentId === id);
                state.battleKeys = state.battleKeys.filter((key) => battleStore.get(key)!.deploymentId === id);
                state.strategyKeys = state.strategyKeys.filter((key) => strategyStore.get(key)!.deploymentId === id);

                deploymentAdapter.updateOne(state.deployments, {
                    id: cid,
                    changes: {
                        isDeploying: false,
                        status: 'notDeployed'
                    }
                });
            })
            .addMatcher(modApi.endpoints.modList.matchFulfilled, (state, action) => {
                state.deployments = deploymentAdapter.setAll(state.deployments, action.payload);
            })
});

export const modReducer = modSlice.reducer;
export const modActions = { ...modSlice.actions, dispose: disposeThunk };

export const deploymentSelectors = deploymentAdapter.getSelectors<AppRootState>((state) => state.mod.deployments);
