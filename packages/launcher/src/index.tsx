import React from 'react';
import ReactDOM from 'react-dom/client';
import * as core from 'sea-core';
import { CoreLoader } from 'sea-core';
import { loadAllCt } from './context/ct';
import extendEngine from './features/extend';

import './index.css';

const EVENT_SEER_READY = 'seerh5_load';
const container = document.getElementById('sea-launcher')!;
const root = ReactDOM.createRoot(container);

const renderApp = async () => {
    console.info(`[info] SeerH5-Assistant Core Loaded Successfully!`);
    await loadAllCt();
    const { default: LauncherMain } = await import('./App');

    root.render(
        <React.StrictMode>
            <LauncherMain />
        </React.StrictMode>
    );
};

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(import.meta.env.MODE === 'production' ? '/sw.js' : '/dev-sw.js?dev-sw');
}

const loader = new CoreLoader(EVENT_SEER_READY);

window.sea = { ...window.sea, ...core, EVENT_SEER_READY };

loader.addSetupFn('afterFirstShowMainPanel', () => {
    config.xml.load('new_super_design');
    config.xml.load('Fragment');
    enableCancelAlertForUsePetItem();
    enableBackgroundHeartBeatCheck();
    extendEngine();
    renderApp();
});

await loader.load();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Alert: any;

/** cancel alert before use item for pet */
function enableCancelAlertForUsePetItem() {
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

/** enable background heartbeat check */
function enableBackgroundHeartBeatCheck() {
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
