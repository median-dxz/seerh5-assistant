import * as seaCore from '@sea/core';
import { NOOP, seac } from '@sea/core';

import { setupForLauncher } from '@/features/setup';
import { IS_DEV } from './constants';

// register service work
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(import.meta.env.MODE === 'production' ? '/sw.js' : '/dev-sw.js?dev-sw');
}

seac.devMode = IS_DEV;

// init sea core
window.sea = { ...window.sea, ...seaCore };

seac.addSetupFn('beforeGameCoreInit', () => {
    OnlineManager.prototype.setSentryScope = NOOP;
    GameInfo.online_gate = GameInfo.online_gate.replace('is_ssl=0', 'is_ssl=1');
    GameInfo.token_url = 'account-co.61.com/v3/token/convert'; // http://account-co.61.com/v3/token/convert
});

seac.addSetupFn('afterFirstShowMainPanel', setupForLauncher);

// init launcher
seac.addSetupFn('afterFirstShowMainPanel', () => {
    const canvas: HTMLCanvasElement = document.querySelector('#egret_player_container canvas')!;
    canvas.setAttribute('tabindex', '-1');
});
