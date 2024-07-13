import { configureStore, type SerializableStateInvariantMiddlewareOptions } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { mainPanelReducer } from '@/services/mainPanelSlice';
import { taskSchedulerReducer } from '@/services/taskSchedulerSlice';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import { listenerMiddleware } from './shared/listenerMiddleware';

export const appStore = configureStore({
    reducer: {
        mainPanel: mainPanelReducer,
        taskScheduler: taskSchedulerReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredPaths: [/taskScheduler\.queue\.[0-9]*\.task\.runner/, /taskScheduler\.queue\.[0-9]*\.error/],
                ignoredActions: ['taskScheduler/enqueue', 'taskScheduler/run/rejected']
            } satisfies SerializableStateInvariantMiddlewareOptions
        }).prepend(listenerMiddleware.middleware)
});

setupListeners(appStore.dispatch);

export type RootState = ReturnType<typeof appStore.getState>;
export type AppDispatch = typeof appStore.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
