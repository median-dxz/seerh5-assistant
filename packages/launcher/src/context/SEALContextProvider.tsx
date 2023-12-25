import React, { type PropsWithChildren } from 'react';

import { MainStateProvider } from './MainStateProvider';
import { ModStoreProvider } from './ModStoreProvider';
import { TaskSchedulerProvider } from './TaskSchedulerProvider';

export function SEALContextProvider({ children }: PropsWithChildren<object>) {
    return (
        <ModStoreProvider>
            <TaskSchedulerProvider>
                <MainStateProvider>{children}</MainStateProvider>
            </TaskSchedulerProvider>
        </ModStoreProvider>
    );
}
