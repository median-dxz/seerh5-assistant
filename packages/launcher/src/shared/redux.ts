import type { AppDispatch, AppRootState } from '@/store';
import {
    addListener,
    asyncThunkCreator,
    buildCreateSlice,
    createListenerMiddleware,
    type TypedAddListener
} from '@reduxjs/toolkit';

export const createAppSlice = buildCreateSlice({
    creators: { asyncThunk: asyncThunkCreator }
});

export const listenerMiddleware = createListenerMiddleware();

export const startAppListening = listenerMiddleware.startListening.withTypes<AppRootState, AppDispatch>();

export const addAppListener: TypedAddListener<AppRootState, AppDispatch> = addListener.withTypes<
    AppRootState,
    AppDispatch
>();
