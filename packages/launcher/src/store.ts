import { configureStore, type SerializableStateInvariantMiddlewareOptions } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';

import { listenerMiddleware } from './shared/redux';

import { initializer } from './features/initializer';
import { launcher } from './features/launcher';
import { mod } from './features/mod';
import { task } from './features/task';
import { taskScheduler } from './features/taskScheduler';

import { dataApi } from './services/data';
import { gameApi } from './services/game';
import { modApi } from './services/mod';

export const appStore = configureStore({
    reducer: {
        launcher: launcher.reducer,
        taskScheduler: taskScheduler.reducer,
        mod: mod.reducer,
        task: task.reducer,
        initializer: initializer.reducer,
        [modApi.reducerPath]: modApi.reducer,
        [dataApi.reducerPath]: dataApi.reducer,
        [gameApi.reducerPath]: gameApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredPaths: [
                    /taskScheduler\.queue\.[0-9]*\.task\.runner/,
                    /taskScheduler\.queue\.[0-9]*\.error/,
                    /api\/mod\.queries\.fetch/,
                    /api\/game\.queries\.bagPets/,
                    /api\/game\.queries\.allPets/
                ],
                ignoreActions: true
            } satisfies SerializableStateInvariantMiddlewareOptions
        })
            .prepend(listenerMiddleware.middleware)
            .concat(modApi.middleware, dataApi.middleware, gameApi.middleware)
});

setupListeners(appStore.dispatch);

export type AppRootState = ReturnType<typeof appStore.getState>;
export type AppDispatch = typeof appStore.dispatch;
