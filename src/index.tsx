/// <reference types="webpack/module" />
import React from 'react';
import ReactDOM from 'react-dom/client';
import { SaMain } from './interface/main';
import './stylesheets/main.css';

const container = document.getElementById('sa-container')!;
const root = ReactDOM.createRoot(container);
root.render(<SaMain />);

import './assisant/saloader';

