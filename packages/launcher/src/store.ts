import { configureStore, type SerializableStateInvariantMiddlewareOptions } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import { useDispatch, useSelector } from 'react-redux';

import { listenerMiddleware } from './shared/redux';

import { initializationReducer } from './features/init/initializationSlice';
import { launcherReducer } from './features/launcherSlice';
import { modReducer } from './features/mod/slice';
import { taskSchedulerReducer } from './features/taskSchedulerSlice';

import { dataApi } from './services/data';
import { gameApi } from './services/game';
import { modApi } from './services/mod';

export const appStore = configureStore({
    reducer: {
        launcher: launcherReducer,
        taskScheduler: taskSchedulerReducer,
        initialization: initializationReducer,
        mod: modReducer,
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
                    /api\/game\.queries\.bagPets/
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

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<AppRootState>();
