import React from 'react';
import ReactDOM from 'react-dom/client';

import LauncherMain from './App';
import { ApplicationContext } from './context/ApplicationContext';
import './init';

ReactDOM.createRoot(document.getElementById('sea-launcher')!).render(
    <React.StrictMode>
        <ApplicationContext>
            <LauncherMain />
        </ApplicationContext>
    </React.StrictMode>
);
