import React from 'react';
import ReactDOM from 'react-dom/client';
import * as core from 'sa-core';
import './index.css';
import { dataProvider } from './service/SADataProvider';

const container = document.getElementById('sa-app')!;
const root = ReactDOM.createRoot(container);

const renderApp = async () => {
    const sac = window.sac;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).sac = { ...core, ...sac };

    core.HelperLoader();
    await dataProvider.init();

    const { default: SaMain } = await import('./App');

    root.render(
        <React.StrictMode>
            <SaMain />
        </React.StrictMode>
    );
};

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(import.meta.env.MODE === 'production' ? '/sw.js' : '/dev-sw.js?dev-sw');
}

window.addEventListener('seerh5_assistant_ready', renderApp);

core.CoreLoader();
