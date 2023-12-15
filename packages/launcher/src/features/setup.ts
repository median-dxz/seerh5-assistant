import { SEAEventSource } from 'sea-core';
import * as Battle from 'sea-core/battle';
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
    disableNewSkillPanel(start$, end$);

    // 启用开发调试输出
    if (IS_DEV) {
        registerLog();
    }

    // 自动战斗需要在Launcher层通过对应hook启用
    const { resolveStrategy } = Battle.Manager;
    start$.on(resolveStrategy);
    roundEnd$.on(resolveStrategy);
}

function disableNewSkillPanel(start$: SEAEventSource<void>, end$: SEAEventSource<void>) {
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
    };

    egret.lifecycle.onResume = () => {
        clearInterval(timer);
        timer = undefined;
    };
}

/* eslint-disable-next-line */
declare var Alert: any;

/** cancel alert before use item for pet */
function cancelAlertForUsePetItem() {
    ItemUseManager.prototype.useItem = function (t, e) {
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
    };
}
