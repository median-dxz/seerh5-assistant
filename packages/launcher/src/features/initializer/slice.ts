import { createAction, type PayloadAction } from '@reduxjs/toolkit';

import * as seaCore from '@sea/core';
import { battle, levelManager, seac, SEAEventSource, type SetupOptions } from '@sea/core';
import { getCompositeId } from '@sea/mod-resolver';

import { IS_DEV } from '@/constants';
import { modApi } from '@/services/mod';
import { createAppSlice, startAppListening, type TaskRunner } from '@/shared';
import type { AppDispatch } from '@/store';

import * as ctService from '../catchTimeBinding/index';
import { launcher } from '../launcher';
import { mod, type ModDeployment } from '../mod';
import { taskScheduler } from '../taskScheduler';

import { preloadSetupMap, setupMap, type SetupMap } from './setup';

export interface InitializerState {
    loadingText: string;
    status: SetupOptions['type'] | 'fulfilled' | 'waitingForLogin' | 'error';
}

const initialState: InitializerState = {
    loadingText: '',
    status: 'beforeGameCoreInit'
};

const prependSetup = (entries: SetupMap, type: SetupOptions['type'], dispatch: AppDispatch) => {
    const length = Object.keys(entries).length;
    let i = 0;
    Object.entries(entries).forEach(([name, setup]) => {
        const loadingItem = `Setup: ${name} (${++i}/${length})`;
        seac.prependSetup(type, setup);
        seac.prependSetup(type, () => {
            dispatch(actions.setLoadingItem(loadingItem));
        });
    });
};

const filterToDeploy = ({ state, status, isDeploying }: ModDeployment) =>
    state.enable && status === 'notDeployed' && !isDeploying;
const filterNotPreload = (dep: ModDeployment) => !dep.state.preload && filterToDeploy(dep);
const filterPreload = (dep: ModDeployment) => dep.state.preload && filterToDeploy(dep);

export const extraActions = {
    init: createAction('initializer/init')
};

export const initializer = createAppSlice({
    name: 'initializer',
    initialState,
    reducers: {
        setLoadingItem(state, action: PayloadAction<string>) {
            state.loadingText = action.payload;
        },
        readyToLogin(state) {
            state.status = 'waitingForLogin';
        },
        mainPanelFirstShown(state) {
            state.status = 'afterFirstShowMainPanel';
        },
        fulfill(state) {
            state.status = 'fulfilled';
        },
        reject(state, action: PayloadAction<string>) {
            state.status = 'error';
            state.loadingText = action.payload;
        }
    },
    selectors: {
        status: (state) => state.status,
        loadingText: (state) => state.loadingText
    }
});

const unsubscribeLoadingItem = startAppListening({
    actionCreator: initializer.actions.setLoadingItem,
    effect(action) {
        IS_DEV && console.log(`[SEAL]: ${action.payload}`);
    }
});

const { actions, selectors } = initializer;

startAppListening({
    actionCreator: extraActions.init,
    async effect(_, api) {
        api.unsubscribe();

        // register service worker
        if ('serviceWorker' in navigator) {
            await navigator.serviceWorker.register(!IS_DEV ? '/sw.js' : '/dev-sw.js?dev-sw');
        }

        // extract sea core to window in development environment
        IS_DEV && (window.sea = { ...window.sea, ...seaCore });

        const ac = new AbortController();
        seac.abortGameLoadSignal = ac.signal;

        // setup 函数会按添加顺序运行

        // preload setup
        prependSetup(preloadSetupMap, 'beforeGameCoreInit', api.dispatch);

        // register listeners
        const battleStart$ = SEAEventSource.hook('battle:start');
        const battleEnd$ = SEAEventSource.hook('battle:end');
        const roundEnd$ = SEAEventSource.hook('battle:roundEnd');

        // 自动战斗需要在Launcher层通过对应hook启用
        battleStart$.on(battle.manager.resolveStrategy);
        battleStart$.on(() => api.dispatch(launcher.fightStart()));
        roundEnd$.on(battle.manager.resolveStrategy);
        battleEnd$.on(() => api.dispatch(launcher.fightEnd()));

        SEAEventSource.levelManger('update').on((action) => {
            const runner = levelManager.getRunner();
            if (!runner) return;

            api.dispatch(taskScheduler.updateRunnerData((runner as TaskRunner).data));
            if (action === 'battle') {
                api.dispatch(taskScheduler.increaseBattleCount());
            }
        });

        document.body.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'p' && e.ctrlKey) {
                api.dispatch(launcher.toggleCommand());
                e.preventDefault();
            }
        });

        // install builtin mods
        // deploy preload type mods
        seac.prependSetup('beforeGameCoreInit', async () => {
            try {
                api.dispatch(actions.setLoadingItem(`Mod Deployment: 安装内置模组...`));
                const { error: installError } = await api.dispatch(modApi.endpoints.installBuiltin.initiate());
                if (installError) throw new Error(installError.message);

                api.dispatch(actions.setLoadingItem(`Mod Deployment: 拉取本地模组列表...`));
                const fetchModList = api.dispatch(
                    modApi.endpoints.indexList.initiate(undefined, {
                        subscribe: true, // 用于在整个生命周期内监听
                        forceRefetch: true
                    })
                );
                await fetchModList.unwrap();

                const deployments = mod.deployments(api.getState()).filter(filterPreload);
                const collectDeployment = api.fork(async () => {
                    let i = 0;
                    while (i < deployments.length) {
                        const [action] = await api.take(mod.deploy.fulfilled.match);
                        api.dispatch(
                            actions.setLoadingItem(
                                `Mod Deployment: 部署预加载模组: ${action.meta.arg} (${++i}/${deployments.length})`
                            )
                        );
                        if (selectors.status(api.getState()) === 'error') {
                            break;
                        }
                    }
                });

                for (const deployment of deployments) {
                    await api.dispatch(mod.deploy(getCompositeId(deployment))).unwrap();
                }

                await collectDeployment.result;
            } catch (e: unknown) {
                api.dispatch(actions.reject(`Initialization: Error: ${(e as Error).message}`));
                ac.abort(e);
                return;
            }

            api.dispatch(actions.setLoadingItem(`正在进入游戏...`));
            const { sea } = window;
            if (sea.SeerH5Ready) {
                api.dispatch(actions.readyToLogin());
            } else {
                window.addEventListener(sea.SEER_READY_EVENT, () => api.dispatch(actions.readyToLogin()), {
                    once: true
                });
            }
        });

        // wait player login
        seac.prependSetup('afterFirstShowMainPanel', () => {
            api.dispatch(actions.mainPanelFirstShown());
        });

        // post setup
        prependSetup(setupMap, 'afterFirstShowMainPanel', api.dispatch);

        // initialize ct service
        // deploy rest mods
        seac.prependSetup('afterFirstShowMainPanel', async () => {
            try {
                api.dispatch(actions.setLoadingItem(`初始化 CatchTimeService`));
                await ctService.sync();
                await api.delay(1000); // ctService.load();

                const deployments = mod.deployments(api.getState()).filter(filterNotPreload);
                const collectDeployment = api.fork(async () => {
                    let i = 0;
                    while (i < deployments.length) {
                        const [action] = await api.take(mod.deploy.fulfilled.match);
                        api.dispatch(
                            actions.setLoadingItem(`部署模组: ${action.meta.arg} (${++i}/${deployments.length})`)
                        );
                        if (selectors.status(api.getState()) === 'error') {
                            break;
                        }
                    }
                });

                for (const deployment of deployments) {
                    await api.dispatch(mod.deploy(getCompositeId(deployment))).unwrap();
                }
                await collectDeployment.result;

                api.dispatch(actions.fulfill());
            } catch (e: unknown) {
                api.dispatch(actions.reject(`Initialization: Error: ${(e as Error).message}`));
            }
        });

        await seac.load();
        unsubscribeLoadingItem();
    }
});
