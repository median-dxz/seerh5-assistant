import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import Launcher from './App';
import { ApplicationContext } from './context/ApplicationContext';

ReactDOM.createRoot(document.getElementById('sea-launcher')!).render(
    <StrictMode>
        <ApplicationContext>
            <Launcher />
        </ApplicationContext>
    </StrictMode>
);
