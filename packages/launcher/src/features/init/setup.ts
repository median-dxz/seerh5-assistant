import { battle, hookPrototype, levelManager, NOOP, SEAEventSource, type SetupOptions } from '@sea/core';

import { IS_DEV } from '@/constants';
import type { TaskRunner } from '@/shared/types';
import { appStore } from '@/store';

import { launcherActions } from '../launcherSlice';
import { taskStateActions } from '../taskSchedulerSlice';
import { extendCore } from './extendCore';
import { extraLog } from './extraLog';

export type SetupMap = Record<string, SetupOptions['setup']>;

export const setupMap: SetupMap = {
    extendCore,
    extraLog: { fn: extraLog, flag: IS_DEV },
    canvasTabindex() {
        const canvas: HTMLCanvasElement = document.querySelector('#egret_player_container canvas')!;
        canvas.setAttribute('tabindex', '-1');
    },
    setupLauncherListeners() {
        const battleStart$ = SEAEventSource.hook('battle:start');
        const battleEnd$ = SEAEventSource.hook('battle:end');
        const roundEnd$ = SEAEventSource.hook('battle:roundEnd');

        // 自动战斗需要在Launcher层通过对应hook启用
        battleStart$.on(battle.manager.resolveStrategy);
        battleStart$.on(() => appStore.dispatch(launcherActions.setIsFighting(true)));
        roundEnd$.on(battle.manager.resolveStrategy);
        battleEnd$.on(() => appStore.dispatch(launcherActions.setIsFighting(false)));

        SEAEventSource.levelManger('update').on((action) => {
            const runner = levelManager.getRunner();
            if (!runner) return;

            appStore.dispatch(taskStateActions.updateData((runner as TaskRunner).data));
            if (action === 'battle') {
                appStore.dispatch(taskStateActions.increaseBattleCount());
            }
        });

        document.body.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'p' && e.ctrlKey) {
                appStore.dispatch(launcherActions.toggleCommand());
                e.preventDefault();
            }
        });
    }
};

export const preloadSetupMap: SetupMap = {
    patchLogin() {
        GameInfo.online_gate = GameInfo.online_gate.replace('is_ssl=0', 'is_ssl=1');
        GameInfo.token_url = 'account-co.61.com/v3/token/convert'; // http://account-co.61.com/v3/token/convert
    },
    fixSoundLoad() {
        hookPrototype(WebSoundManager, 'loadFightMusic', function (f, url) {
            url = SeerVersionController.getVersionUrl(url);
            return f.call(this, url);
        });
        hookPrototype(WebSoundManager, 'loadSound', function (f, url) {
            url = SeerVersionController.getVersionUrl(url);
            return f.call(this, url);
        });
    },
    disableSentry() {
        OnlineManager.prototype.setSentryScope = NOOP;
    }
};
