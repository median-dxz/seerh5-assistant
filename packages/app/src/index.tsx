import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { useCore } from './provider/useCore';
import { useMod } from './provider/useMod';
import './stylesheets/main.css';

const container = document.getElementById('sa-container')!;
const root = ReactDOM.createRoot(container);

const SaMain = React.lazy(async () => {
    return import(/* webpackChunkName: "SaAppMain" */ './components/views/main');
});

const renderApp = async () => {
    const canvas: HTMLCanvasElement = document.querySelector('#egret_player_container canvas')!;
    canvas.setAttribute('tabindex', '-1');
    root.render(
        <Suspense>
            <SaMain />
        </Suspense>
    );
};

window.addEventListener('seerh5_assistant_ready', renderApp);

await useCore();
await useMod();
