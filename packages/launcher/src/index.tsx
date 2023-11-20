import React from 'react';
import ReactDOM from 'react-dom/client';
import * as core from 'sea-core';
import { loadAllCt } from './context/ct';
import './index.css';

const container = document.getElementById('sea-launcher')!;
const root = ReactDOM.createRoot(container);

const renderApp = async () => {
    console.info(`[info] SeerH5-Assistant Core Loaded Successfully!`);
    
    const sea = window.sea;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).sea = { ...core, ...sea };
    await loadAllCt();

    core.HelperLoader();

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

await core.CoreLoader('seerh5_load');

renderApp();