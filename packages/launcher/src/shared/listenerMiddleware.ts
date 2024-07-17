import { addListener, createListenerMiddleware, type TypedAddListener } from '@reduxjs/toolkit';
import type { AppDispatch, AppRootState } from '../store';

export const listenerMiddleware = createListenerMiddleware();

export const startAppListening = listenerMiddleware.startListening.withTypes<AppRootState, AppDispatch>();

export const addAppListener: TypedAddListener<AppRootState, AppDispatch> = addListener.withTypes<
    AppRootState,
    AppDispatch
>();
