import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import LauncherMain from './App';

const container = document.getElementById('sea-launcher');

if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
        <React.StrictMode>
            <LauncherMain />
        </React.StrictMode>
    );
}
