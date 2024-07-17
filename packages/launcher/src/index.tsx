import React from 'react';
import ReactDOM from 'react-dom/client';

import Launcher from './App';
import { ApplicationContext } from './context/ApplicationContext';

import * as seaCore from '@sea/core';
import { seac } from '@sea/core';

import { IS_DEV } from './constants';
import { LauncherInitializer } from './context/LauncherInitializer';
import { initializationActions } from './features/init/initializationSlice';
import { appStore } from './store';

// register service worker
if ('serviceWorker' in navigator) {
    await navigator.serviceWorker.register(!IS_DEV ? '/sw.js' : '/dev-sw.js?dev-sw');
}

// setup sea core for development environment
seac.devMode = IS_DEV;
window.sea = { ...window.sea, ...seaCore };

appStore.dispatch(initializationActions.SEALInitialization());

ReactDOM.createRoot(document.getElementById('sea-launcher')!).render(
    <React.StrictMode>
        <ApplicationContext>
            <LauncherInitializer>
                <Launcher />
            </LauncherInitializer>
        </ApplicationContext>
    </React.StrictMode>
);
