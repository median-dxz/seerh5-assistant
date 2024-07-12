import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { mainPanelReducer } from '@/services/mainPanelSlice';
import { taskSchedulerReducer } from '@/services/taskSchedulerSlice';
import { listenerMiddleware } from './shared/listenerMiddleware';

export const appStore = configureStore({
    reducer: {
        mainPanel: mainPanelReducer,
        taskScheduler: taskSchedulerReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware)
});

export type RootState = ReturnType<typeof appStore.getState>;
export type AppDispatch = typeof appStore.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
