import * as seaCore from '@sea/core';
import { seac } from '@sea/core';

import { setupForLauncher } from '@/features/setup';
import { IS_DEV } from './constants';

// register service work
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(import.meta.env.MODE === 'production' ? '/sw.js' : '/dev-sw.js?dev-sw');
}

seac.devMode = IS_DEV;

// init sea core
window.sea = { ...window.sea, ...seaCore };

seac.addSetupFn('afterFirstShowMainPanel', setupForLauncher);

// init launcher
seac.addSetupFn('afterFirstShowMainPanel', () => {
    const canvas: HTMLCanvasElement = document.querySelector('#egret_player_container canvas')!;
    canvas.setAttribute('tabindex', '-1');
});
