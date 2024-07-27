import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import Launcher from './App';
import { ApplicationContext } from './context/ApplicationContext';
import { InitializationView } from './views/InitializationView';

import { initializationActions } from './features/init/initializationSlice';
import { appStore } from './store';

appStore.dispatch(initializationActions.init());

ReactDOM.createRoot(document.getElementById('sea-launcher')!).render(
    <StrictMode>
        <ApplicationContext>
            <InitializationView />
            <Launcher />
        </ApplicationContext>
    </StrictMode>
);
