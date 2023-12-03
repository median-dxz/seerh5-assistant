import { loader } from '@/init';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const container = document.getElementById('sea-launcher');

if (container) {
    await loader.load();

    const root = ReactDOM.createRoot(container);
    const { default: LauncherMain } = await import('./App');

    root.render(
        <React.StrictMode>
            <LauncherMain />
        </React.StrictMode>
    );
}
