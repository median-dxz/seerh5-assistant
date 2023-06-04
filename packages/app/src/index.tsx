import React from 'react';
import ReactDOM from 'react-dom/client';
import { CoreLoader, HelperLoader } from 'sa-core';
import './stylesheets/main.css';
import { registerAllMod } from './utils/registerMods';

const container = document.getElementById('sa-app')!;
const root = ReactDOM.createRoot(container);

const renderApp = async () => {
    HelperLoader();
    await registerAllMod();
    const canvas: HTMLCanvasElement = document.querySelector('#egret_player_container canvas')!;
    canvas.setAttribute('tabindex', '-1');
    const { default: SaMain } = await import('./components/views/main');
    root.render(<SaMain />);
};

if (import.meta.env.DEV) {
    window.wwwroot = '/dev/seerh5.61.com/';
} else {
    window.wwwroot = '/seerh5.61.com/';
}

fetch(`${window.wwwroot}app.js?t=${Date.now()}`)
    .then((response) => response.text())
    .then((appJs) => {
        const script = document.createElement('script');
        while (appJs.startsWith('eval')) {
            appJs = eval(appJs.match(/eval([^)].*)/)![1]);
        }
        script.innerHTML = appJs.replace(/loadSingleScript.*baidu.*\r\n/, '');
        document.body.appendChild(script);
    });

window.addEventListener('seerh5_assistant_ready', renderApp);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(
        import.meta.env.MODE === 'production' ? '/service-worker.js' : '/dev-sw.js?dev-sw'
    );
}

CoreLoader();
