import * as core from 'sea-core';
import { CoreLoader, NOOP, log } from 'sea-core';

import { IS_DEV } from '@/constants';
import { setupForLauncher } from '@/features/setup';

// register service work
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(import.meta.env.MODE === 'production' ? '/sw.js' : '/dev-sw.js?dev-sw');
}

// init sea core
export const loader = new CoreLoader();
window.sea = { ...window.sea, ...core };
loader.addSetupFn('afterFirstShowMainPanel', setupForLauncher);

if (IS_DEV) {
    loader.addSetupFn('beforeGameCoreInit', log.enable);
}

loader.addSetupFn('beforeGameCoreInit', () => {
    OnlineManager.prototype.setSentryScope = NOOP;
    GameInfo.online_gate = GameInfo.online_gate.replace('is_ssl=0', 'is_ssl=1');
    GameInfo.token_url = 'account-co.61.com/v3/token/convert'; // http://account-co.61.com/v3/token/convert
});

// init launcher
loader.addSetupFn('afterFirstShowMainPanel', () => {
    const canvas: HTMLCanvasElement = document.querySelector('#egret_player_container canvas')!;
    canvas.setAttribute('tabindex', '-1');
});
