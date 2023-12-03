import * as core from 'sea-core';
import { CoreLoader, log } from 'sea-core';

import { EVENT_SEER_READY, IS_DEV } from '@/constants';
import { setupForLauncher } from '@/features/setup';

// register service work
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(import.meta.env.MODE === 'production' ? '/sw.js' : '/dev-sw.js?dev-sw');
}

// init sea core
export const loader = new CoreLoader(EVENT_SEER_READY);
window.sea = { ...window.sea, ...core, EVENT_SEER_READY };
loader.addSetupFn('afterFirstShowMainPanel', setupForLauncher);

if (IS_DEV) {
    loader.addSetupFn('beforeGameCoreInit', log.enable);
}

// init launcher
loader.addSetupFn('afterFirstShowMainPanel', () => {
    const canvas: HTMLCanvasElement = document.querySelector('#egret_player_container canvas')!;
    canvas.setAttribute('tabindex', '-1');
});
