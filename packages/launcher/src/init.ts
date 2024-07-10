import * as seaCore from '@sea/core';
import { seac } from '@sea/core';

import { setupForLauncher } from '@/features/setup';
import { IS_DEV } from './constants';

// register service work
if ('serviceWorker' in navigator) {
    await navigator.serviceWorker.register(import.meta.env.MODE === 'production' ? '/sw.js' : '/dev-sw.js?dev-sw');
}

// init sea core
seac.devMode = IS_DEV;
window.sea = { ...window.sea, ...seaCore };

// init launcher
seac.addSetupFn('afterFirstShowMainPanel', setupForLauncher);
seac.addSetupFn('afterFirstShowMainPanel', () => {
    const canvas: HTMLCanvasElement = document.querySelector('#egret_player_container canvas')!;
    canvas.setAttribute('tabindex', '-1');
});
