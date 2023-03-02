/// <reference types="webpack/module" />
import React from 'react';
import ReactDOM from 'react-dom/client';
import './stylesheets/main.css';

const container = document.getElementById('sa-container')!;
const root = ReactDOM.createRoot(container);

const onCoreReady = async () => {
    const canvas: HTMLCanvasElement = document.querySelector('#egret_player_container canvas')!;
    canvas.setAttribute('tabindex', '-1');
    const { SaMain } = await import('./app/main');
    root.render(<SaMain />);
};

import('./sa_loader').catch((e) => {
    console.error('[GameLoader]: Seerh5 assistant Load Failed!');
});

if (window.SACoreReady) {
    onCoreReady();
} else {
    window.addEventListener('seerh5_assistant_ready', onCoreReady);
}

if (import.meta.webpackHot) {
    import.meta.webpackHot.accept();
}
