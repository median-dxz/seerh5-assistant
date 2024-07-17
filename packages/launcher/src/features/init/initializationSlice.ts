import { IS_DEV } from '@/constants';
import { modApi } from '@/services/mod';
import { createAppSlice } from '@/shared/createAppSlice';
import { startAppListening } from '@/shared/listenerMiddleware';
import type { AppDispatch } from '@/store';
import { createAction, type PayloadAction } from '@reduxjs/toolkit';
import { seac, type SetupOptions } from '@sea/core';
import * as ctService from '../catchTimeBinding/index';
import { deploymentSelectors, modActions, type ModDeployment } from '../mod/slice';
import { getCompositeId } from '../mod/utils';
import { preloadSetupMap, setupMap, type SetupMap } from './setup';

export interface InitializationState {
    loadingItem: string;
    error: string;
    status: SetupOptions['type'] | 'fulfilled' | 'waitingForLogin' | 'error';
}

const initialState: InitializationState = {
    loadingItem: '',
    error: '',
    status: 'beforeGameCoreInit'
};

const prependSetup = (entries: SetupMap, type: SetupOptions['type'], dispatch: AppDispatch) => {
    const length = Object.keys(entries).length;
    let i = 0;
    Object.entries(entries).forEach(([name, setup]) => {
        const loadingItem = `Setup: ${name} (${++i}/${length})`;
        seac.prependSetup(type, setup);
        seac.prependSetup(type, () => {
            dispatch(initializationActions.setLoadingItem(loadingItem));
        });
    });
};

const filterToDeploy = ({ state, status, isDeploying }: ModDeployment) =>
    state.enable && status === 'notDeployed' && !isDeploying;
const filterNotPreload = (dep: ModDeployment) => !dep.state.preload && filterToDeploy(dep);
const filterPreload = (dep: ModDeployment) => dep.state.preload && filterToDeploy(dep);

const SEALInitialization = createAction('SEAL/internal/init');

const initializationSlice = createAppSlice({
    name: 'initialization',
    initialState,
    reducers: {
        setLoadingItem(state, action: PayloadAction<string>) {
            state.loadingItem = action.payload;
        },
        readyToLogin(state) {
            state.status = 'waitingForLogin';
        },
        mainPanelFirstShow(state) {
            state.status = 'afterFirstShowMainPanel';
        },
        fulfilled(state) {
            state.status = 'fulfilled';
        },
        error(state, action: PayloadAction<string>) {
            state.status = 'error';
            state.error = action.payload;
        }
    }
    // extraReducers: (builder) =>
});

const unsubscribeLoadingItem = startAppListening({
    actionCreator: initializationSlice.actions.setLoadingItem,
    effect(action) {
        IS_DEV && console.log(`[SEAL]: ${action.payload}`);
    }
});

startAppListening({
    actionCreator: SEALInitialization,
    async effect(_, api) {
        api.unsubscribe();
        const ac = new AbortController();
        seac.abortGameLoadSignal = ac.signal;

        // setup 函数会按添加顺序运行

        // preload setup
        prependSetup(preloadSetupMap, 'beforeGameCoreInit', api.dispatch);

        // install builtin mods
        // deploy preload type mods
        seac.prependSetup('beforeGameCoreInit', async () => {
            try {
                api.dispatch(initializationActions.setLoadingItem(`Mod Deployment: 安装内置模组...`));
                const { error: installError } = await api.dispatch(modApi.endpoints.installBuiltin.initiate());
                if (installError) throw new Error(installError.message);

                api.dispatch(initializationActions.setLoadingItem(`Mod Deployment: 拉取本地模组列表...`));
                const fetchModList = api.dispatch(
                    modApi.endpoints.modList.initiate(undefined, {
                        subscribe: false,
                        forceRefetch: true
                    })
                );
                await fetchModList.unwrap();

                const deployments = deploymentSelectors.selectAll(api.getState()).filter(filterPreload);
                const collectDeployment = api.fork(async () => {
                    let i = 0;
                    while (i < deployments.length) {
                        const [action] = await api.take(modActions.deploy.fulfilled.match);
                        api.dispatch(
                            initializationActions.setLoadingItem(
                                `Mod Deployment: 部署预加载模组: ${action.meta.arg} (${++i}/${deployments.length})`
                            )
                        );
                        if (api.getState().initialization.status === 'error') {
                            break;
                        }
                    }
                });

                for (const deployment of deployments) {
                    await api.dispatch(modActions.deploy(getCompositeId(deployment))).unwrap();
                }

                await collectDeployment.result;
            } catch (e: unknown) {
                api.dispatch(initializationActions.error(`Initialization: Error: ${(e as Error).message}`));
                ac.abort(e);
                return;
            }

            api.dispatch(initializationActions.setLoadingItem(`正在进入游戏...`));
            const { sea } = window;
            if (sea.SeerH5Ready) {
                api.dispatch(initializationActions.readyToLogin());
            } else {
                window.addEventListener(
                    sea.SEER_READY_EVENT,
                    () => api.dispatch(initializationActions.readyToLogin()),
                    { once: true }
                );
            }
        });

        // wait player login
        seac.prependSetup('afterFirstShowMainPanel', () => {
            api.dispatch(initializationActions.mainPanelFirstShow());
        });

        // post setup
        prependSetup(setupMap, 'afterFirstShowMainPanel', api.dispatch);

        // initialize ct service
        // deploy rest mods
        seac.prependSetup('afterFirstShowMainPanel', async () => {
            try {
                api.dispatch(initializationActions.setLoadingItem(`初始化 CatchTimeService`));
                await ctService.sync();
                await api.delay(1000); // ctService.load();

                const deployments = deploymentSelectors.selectAll(api.getState()).filter(filterNotPreload);
                const collectDeployment = api.fork(async () => {
                    let i = 0;
                    while (i < deployments.length) {
                        const [action] = await api.take(modActions.deploy.fulfilled.match);
                        api.dispatch(
                            initializationActions.setLoadingItem(
                                `部署模组: ${action.meta.arg} (${++i}/${deployments.length})`
                            )
                        );
                        if (api.getState().initialization.status === 'error') {
                            break;
                        }
                    }
                });

                for (const deployment of deployments) {
                    await api.dispatch(modActions.deploy(getCompositeId(deployment))).unwrap();
                }
                await collectDeployment.result;

                api.dispatch(initializationActions.fulfilled());
            } catch (e: unknown) {
                api.dispatch(initializationActions.error(`Initialization: Error: ${(e as Error).message}`));
            }
        });

        await seac.load();
        unsubscribeLoadingItem();
    }
});

export const initializationReducer = initializationSlice.reducer;
export const initializationActions = { ...initializationSlice.actions, SEALInitialization };
