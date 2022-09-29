/// <reference types="webpack/module" />
import React from 'react';
import ReactDOM from 'react-dom/client';
import { SaMain } from './interface/main';
import './stylesheets/main.css';

const container = document.getElementById('sa-container')!;
const root = ReactDOM.createRoot(container);

import('./assistant/saloader').catch((e) => {
    console.error('[GameLoader]: Seerh5 assistant Load Failed!');
});

if (window.SACoreReady) {
    root.render(<SaMain />);
} else {
    window.addEventListener('seerh5_assistant_ready', () => {
        root.render(<SaMain />);
    });
}
