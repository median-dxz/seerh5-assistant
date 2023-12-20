import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import LauncherMain from './App';
import { ApplicationContext } from './context/ApplicationContext';
import './init';

const container = document.getElementById('sea-launcher')!;

const root = ReactDOM.createRoot(container);
root.render(
    <React.StrictMode>
        <ApplicationContext>
            <LauncherMain />
        </ApplicationContext>
    </React.StrictMode>
);
