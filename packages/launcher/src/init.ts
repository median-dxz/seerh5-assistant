import * as seaCore from '@sea/core';
import { core, coreLog, NOOP } from '@sea/core';

import { IS_DEV } from '@/constants';
import { setupForLauncher } from '@/features/setup';

// register service work
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(import.meta.env.MODE === 'production' ? '/sw.js' : '/dev-sw.js?dev-sw');
}

coreLog.setDev(IS_DEV);

// init sea core
window.sea = { ...window.sea, ...seaCore };

core.addSetupFn('beforeGameCoreInit', () => {
    OnlineManager.prototype.setSentryScope = NOOP;
    GameInfo.online_gate = GameInfo.online_gate.replace('is_ssl=0', 'is_ssl=1');
    GameInfo.token_url = 'account-co.61.com/v3/token/convert'; // http://account-co.61.com/v3/token/convert
});

core.addSetupFn('afterFirstShowMainPanel', setupForLauncher);

// init launcher
core.addSetupFn('afterFirstShowMainPanel', () => {
    const canvas: HTMLCanvasElement = document.querySelector('#egret_player_container canvas')!;
    canvas.setAttribute('tabindex', '-1');
});
