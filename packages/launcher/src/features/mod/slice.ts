import { createEntityAdapter, nanoid, type EntityState } from '@reduxjs/toolkit';

import type { SEAModExport } from '@sea/mod-type';

import { modApi } from '@/services/mod';
import { createAppSlice, getCompositeId, startAppListening } from '@/shared';
import { CommonLoggerBuilder } from '@/shared/logger';
import type { AppDispatch, AppRootState } from '@/store';

import { taskScheduler } from '../taskScheduler';

import { createModContext, ModInstance } from './handler';
import { battleStore, commandStore, modInsStore, strategyStore, taskStore } from './store';
import type { ModDeployment, ModExportsRef } from './utils';

export interface DeploymentState {
    deployments: EntityState<ModDeployment, string>;
    taskRefs: ModExportsRef[];
    commandRefs: ModExportsRef[];
    battleKeys: string[];
    strategyKeys: string[];
}

export const deploymentAdapter = createEntityAdapter({
    selectId: (deployment: ModDeployment) => getCompositeId(deployment)
});

const initialState: DeploymentState = {
    deployments: deploymentAdapter.getInitialState(),
    taskRefs: [],
    commandRefs: [],
    battleKeys: [],
    strategyKeys: []
};

export const isDeployed = (dep: ModDeployment): dep is ModDeployment<'deployed'> => dep.status === 'deployed';

export const mod = createAppSlice({
    name: 'mod',
    initialState,
    reducers: (create) => ({
        deploy: create.asyncThunk<string, string>(
            async (cid, api) => {
                const dispatch = api.dispatch as AppDispatch;
                const dep = selectors.getDeploymentById(api.getState() as AppRootState, cid);

                const { factory, metadata } = await dispatch(modApi.endpoints.fetch.initiate(dep)).unwrap();

                const loggerBuilder = new CommonLoggerBuilder(metadata.id);
                const context = await createModContext(metadata, loggerBuilder); // try-catch
                const modExport = await factory(context); // try-catch
                const deploymentId = nanoid();

                const instance = new ModInstance(deploymentId, context, modExport); // try-catch
                instance.onDataChanged = (data) =>
                    dispatch(modApi.endpoints.setData.initiate({ compositeId: cid, data }));
                modInsStore.set(deploymentId, instance);
                // TODO 在logger架构更新中重写
                loggerBuilder.trace((msg) => dispatch(taskScheduler.traceRunnerLog(msg)));

                (['commands', 'tasks', 'strategies', 'battles'] as const).forEach((key) => {
                    if (modExport[key] == undefined) {
                        modExport[key] = [];
                    }
                });

                const { commands, battles, strategies, tasks } = modExport as Required<SEAModExport>;

                const createRef = (key: string): ModExportsRef => ({
                    deploymentId,
                    cid: getCompositeId(metadata),
                    key
                });

                const commandRefs = Object.values(commands).map((command) => {
                    const ref = createRef(command.name);
                    commandStore.add(ref, command);
                    instance.addFinalizer(() => commandStore.delete(ref));
                    return ref;
                });

                const taskRefs = Object.values(tasks).map((task) => {
                    const ref = createRef(task.metadata.id);
                    taskStore.add(ref, task);
                    instance.addFinalizer(() => taskStore.delete(ref));
                    return ref;
                });

                const strategyKeys = Object.values(strategies).map((strategy) => {
                    strategyStore.add(deploymentId, strategy.name, strategy);
                    instance.addFinalizer(() => strategyStore.delete(strategy.name));
                    return strategy.name;
                });

                const battleKeys = Object.values(battles).map((battle) => {
                    battleStore.add(deploymentId, battle.name, battle);
                    instance.addFinalizer(() => battleStore.delete(battle.name));
                    return battle.name;
                });

                dispatch(actions.addExports({ commandRefs, taskRefs, strategyKeys, battleKeys }));

                return deploymentId;
            },
            {
                options: {
                    condition(cid, { getState }): boolean {
                        const deployment = selectors.getDeploymentById(getState() as AppRootState, cid);
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
        ),
        dispose: create.reducer<string>((state, action) => {
            const cid = action.payload;
            const dep = state.deployments.entities[cid];
            if (!isDeployed(dep)) return;
            const { deploymentId } = dep;

            state.commandRefs = state.commandRefs.filter((ref) => ref.deploymentId === deploymentId);
            state.taskRefs = state.taskRefs.filter((ref) => ref.deploymentId === deploymentId);
            state.battleKeys = state.battleKeys.filter((key) => battleStore.get(key)!.deploymentId === deploymentId);
            state.strategyKeys = state.strategyKeys.filter(
                (key) => strategyStore.get(key)!.deploymentId === deploymentId
            );

            deploymentAdapter.updateOne(state.deployments, {
                id: cid,
                changes: {
                    isDeploying: false,
                    status: 'notDeployed'
                }
            });
        })
    }),
    extraReducers: (builder) =>
        builder.addMatcher(modApi.endpoints.indexList.matchFulfilled, (state, action) => {
            const indexList = action.payload;
            const deployments = state.deployments;
            const checked = new Set<string>();
            indexList.forEach((value) => {
                const cid = getCompositeId(value);
                const current = deployments.entities[cid];
                checked.add(cid);
                if (current !== undefined) {
                    // 已有的mod刷新state
                    deploymentAdapter.updateOne(deployments, { id: cid, changes: { state: value.state } });
                } else {
                    // 新加的mod直接添加
                    deploymentAdapter.addOne(deployments, { ...value, status: 'notDeployed', isDeploying: false });
                }
            });

            // 没有的mod标记删除
            const toDelete = deployments.ids.filter((id) => !checked.has(id));
            deploymentAdapter.removeMany(deployments, toDelete);
        }),
    selectors: {
        getDeploymentById: ({ deployments }, id: string) =>
            deploymentAdapter.getSelectors().selectById(deployments, id),
        deployments: ({ deployments }) => deploymentAdapter.getSelectors().selectAll(deployments),
        taskRefs: ({ taskRefs }) => taskRefs,
        commandRefs: ({ commandRefs }) => commandRefs,
        battleKeys: ({ battleKeys }) => battleKeys,
        strategyKeys: ({ strategyKeys }) => strategyKeys
    }
});

const { selectors, actions } = mod;

startAppListening({
    actionCreator: actions.dispose,
    effect(action, { getOriginalState }) {
        const dep = selectors.getDeploymentById(getOriginalState(), action.payload);
        if (!isDeployed(dep)) return;

        const { deploymentId } = dep;
        const ins = modInsStore.get(deploymentId)!;
        modInsStore.delete(deploymentId);
        ins.dispose();
        console.log(`撤销部署: ${ins.compositeId}: ${ins.deploymentId}`);
    }
});
