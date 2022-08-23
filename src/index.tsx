/// <reference types="webpack/module" />
import './stylesheets/main.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { SaMain } from './interface/main';

const container = document.getElementById('sa-container')!;
const root = ReactDOM.createRoot(container);
root.render(<SaMain />);

if (import.meta.webpackHot) {
    import.meta.webpackHot.accept('./interface/main', function () {
        root.render(<SaMain />);
    });
}

import './proxy/saloader';

