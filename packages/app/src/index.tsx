import React from 'react';
import ReactDOM from 'react-dom/client';
import { CoreLoader, HelperLoader } from 'sa-core';
import { useMod } from './hooks/useMod';
import './stylesheets/main.css';

const container = document.getElementById('sa-app')!;
const root = ReactDOM.createRoot(container);

const renderApp = async () => {
    HelperLoader();
    await useMod();
    const canvas: HTMLCanvasElement = document.querySelector('#egret_player_container canvas')!;
    canvas.setAttribute('tabindex', '-1');
    const { default: SaMain } = await import(/* webpackChunkName: "SaAppMain" */ './components/views/main');
    root.render(<SaMain />);
};

window.addEventListener('seerh5_assistant_ready', renderApp);

CoreLoader();
