import './stylesheets/main.css';
import ReactDOM from 'react-dom/client';
import React from 'react';
import { SaMain } from './interface/main.jsx';

const container = document.getElementById('sa-container');
const root = ReactDOM.createRoot(container);
root.render(<SaMain />);

if (import.meta.webpackHot) {
    import.meta.webpackHot.accept('./interface/main.jsx', function () {
        root.render(<SaMain />);
    });
}

import './proxy/saloader.js';
