/// <reference types="webpack/module" />
import React from 'react';
import ReactDOM from 'react-dom/client';
import './stylesheets/main.css';

const container = document.getElementById('sa-container')!;

const root = ReactDOM.createRoot(container);
const renderApp = async () => {
    const canvas: HTMLCanvasElement = document.querySelector('#egret_player_container canvas')!;
    canvas.setAttribute('tabindex', '-1');
    const { SaMain } = await import(/* webpackChunkName: "SaAppMain" */ './app/main');
    root.render(<SaMain />);
};

window.addEventListener('seerh5_assistant_ready', renderApp);