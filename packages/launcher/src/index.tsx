import React from 'react';
import ReactDOM from 'react-dom/client';

import LauncherMain from './App';
import { ApplicationContext } from './context/ApplicationContext';

import * as seaCore from '@sea/core';
import { seac } from '@sea/core';

import { IS_DEV } from './constants';
import { setupForLauncher } from './features/setup';

// register service worker
if ('serviceWorker' in navigator) {
    await navigator.serviceWorker.register(!IS_DEV ? '/sw.js' : '/dev-sw.js?dev-sw');
}

// init sea core
seac.devMode = IS_DEV;
window.sea = { ...window.sea, ...seaCore };

// init launcher
seac.addSetupFn('afterFirstShowMainPanel', setupForLauncher);

ReactDOM.createRoot(document.getElementById('sea-launcher')!).render(
    <React.StrictMode>
        <ApplicationContext>
            <LauncherMain />
        </ApplicationContext>
    </React.StrictMode>
);
