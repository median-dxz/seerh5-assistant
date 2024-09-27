import { configureStore, type SerializableStateInvariantMiddlewareOptions } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';

import { initializer } from './features/initializer';
import { launcher } from './features/launcher';
import { mod } from './features/mod';
import { packetCapture } from './features/packetCapture';
import { taskScheduler } from './features/taskScheduler';

import { gameApi } from './services/game';
import { launcherApi } from './services/launcher';
import { modApi } from './services/mod';

import { listenerMiddleware } from './shared/redux';

export const appStore = configureStore({
    reducer: {
        launcher: launcher.reducer,
        taskScheduler: taskScheduler.reducer,
        mod: mod.reducer,
        initializer: initializer.reducer,
        packetCapture: packetCapture.reducer,
        [modApi.reducerPath]: modApi.reducer,
        [launcherApi.reducerPath]: launcherApi.reducer,
        [gameApi.reducerPath]: gameApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredPaths: [
                    /taskScheduler\.queue\.[0-9]*\.task\.runner/,
                    /taskScheduler\.queue\.[0-9]*\.error/,
                    /packetCapture\.packets/,
                    /api\/mod\.queries\.fetch/,
                    /api\/game\.queries\.bagPets/,
                    /api\/game\.queries\.allPets/,
                    /api\/mod.mutations\..*\.error/
                ],
                ignoreActions: true
            } satisfies SerializableStateInvariantMiddlewareOptions
        })
            .prepend(listenerMiddleware.middleware)
            .concat(modApi.middleware, launcherApi.middleware, gameApi.middleware)
});

setupListeners(appStore.dispatch);

export type AppRootState = ReturnType<typeof appStore.getState>;
export type AppDispatch = typeof appStore.dispatch;
