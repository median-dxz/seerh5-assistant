import { addListener, createListenerMiddleware, type TypedAddListener } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../store';

export const listenerMiddleware = createListenerMiddleware();

export const startAppListening = listenerMiddleware.startListening.withTypes<RootState, AppDispatch>();

export const addAppListener: TypedAddListener<RootState, AppDispatch> = addListener.withTypes<RootState, AppDispatch>();
