import { extendEngine } from 'sea-core/engine';
import { updateBattleFireInfo } from './engine';
import { registerLog } from './registerLog';

export function setupForLauncher() {
    config.xml.load('new_super_design');
    config.xml.load('Fragment');

    extendEngine({ updateBattleFireInfo });
    backgroundHeartBeatCheck();
    cancelAlertForUsePetItem();

    registerLog();
}

/** enable background heartbeat check */
export function backgroundHeartBeatCheck() {
    let timer: number | undefined = undefined;

    egret.lifecycle.onPause = () => {
        const { setInterval } = window;
        timer = setInterval(() => {
            if (!SocketConnection.mainSocket.connected) return;
            SystemTimerManager.queryTime();
        }, 5000);
    };

    egret.lifecycle.onResume = () => {
        clearInterval(timer);
        timer = undefined;
    };
}

/* eslint-disable-next-line */
declare var Alert: any;

/** cancel alert before use item for pet */
export function cancelAlertForUsePetItem() {
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
