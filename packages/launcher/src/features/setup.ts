/* eslint-disable */

import { taskStateActions } from '@/services/taskSchedulerSlice';
import type { TaskRunner } from '@/shared/types';
import { appStore } from '@/store';
import { GameConfigRegistry, SEAEventSource, battle, hookPrototype, levelManager } from '@sea/core';
import { IS_DEV } from '../constants';
import { extendCoreEngine } from './engine';
import { registerLog } from './registerLog';

export function setupForLauncher() {
    const start$ = SEAEventSource.hook('battle:start');
    const roundEnd$ = SEAEventSource.hook('battle:roundEnd');
    const end$ = SEAEventSource.hook('battle:end');

    config.xml.load('new_super_design');
    config.xml.load('Fragment');

    extendCoreEngine();
    backgroundHeartBeatCheck();
    cancelAlertForUsePetItem();

    // 启用开发调试输出
    if (IS_DEV) {
        registerLog();
    }

    // 自动战斗需要在Launcher层通过对应hook启用
    start$.on(battle.manager.resolveStrategy);
    roundEnd$.on(battle.manager.resolveStrategy);

    // 屏蔽战斗结束后的获取新技能收发包, 从而屏蔽新技能面板的弹出
    start$.on(() => {
        SocketConnection.removeCmdListener(
            CommandID.NOTE_UPDATE_SKILL,
            PetUpdateCmdListener.onUpdateSkill,
            PetUpdateCmdListener
        );
    });
    end$.on(() => {
        SocketConnection.addCmdListener(
            CommandID.NOTE_UPDATE_SKILL,
            PetUpdateCmdListener.onUpdateSkill,
            PetUpdateCmdListener
        );
    });

    SEAEventSource.levelManger('update').on((action) => {
        const runner = levelManager.getRunner();
        if (!runner) return;

        appStore.dispatch(taskStateActions.updateData((runner as TaskRunner).data));
        if (action === 'battle') {
            appStore.dispatch(taskStateActions.increaseBattleCount());
        }
    });

    GameConfigRegistry.register('nature', {
        objectId: (obj) => obj.id,
        objectName: (obj) => obj.name,
        objectMap: new Map(Object.values(NatureXMLInfo._dataMap).map((obj) => [obj.id, obj]))
    });
}

declare class LifeCycleManager {
    static readonly LIFE_CYCLE_PAUSE: 'LIFE_CYCLE_PAUSE';
    static readonly LIFE_CYCLE_RESUME: 'LIFE_CYCLE_RESUME';
}

/** enable background heartbeat check */
function backgroundHeartBeatCheck() {
    let timer: number | undefined = undefined;

    egret.lifecycle.onPause = () => {
        const { setInterval } = window;
        timer = setInterval(() => {
            if (!SocketConnection.mainSocket.connected) return;
            SystemTimerManager.queryTime();
        }, 3000);
        EventManager.dispatchEventWith(LifeCycleManager.LIFE_CYCLE_PAUSE);
    };

    egret.lifecycle.onResume = () => {
        clearInterval(timer);
        timer = undefined;
        EventManager.dispatchEventWith(LifeCycleManager.LIFE_CYCLE_RESUME);
    };

    setInterval(
        () => {
            if (!SocketConnection.mainSocket.connected) return;
            SystemTimerManager.queryTime();
        },
        4000 + Math.trunc(Math.random() * 1000)
    );
}

declare var Alert: any;

/** cancel alert before use item for pet */
function cancelAlertForUsePetItem() {
    hookPrototype(ItemUseManager, 'useItem', function (_, t, e) {
        if (!t) return void BubblerManager.getInstance().showText('使用物品前，请先选择一只精灵');
        e = Number(e);

        const use = () => {
            const r = ItemXMLInfo.getName(e);
            this.$usePetItem({ petInfo: t, itemId: ~~e, itemName: r }, e);
        };

        if (e >= 0) {
            if (e === 300066) {
                Alert.show(`你确定要给 ${t.name} 使用通用刻印激活水晶吗`, use);
            } else {
                use();
            }
        }
    });
}
