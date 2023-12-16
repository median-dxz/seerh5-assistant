import React, { type PropsWithChildren } from 'react';

import { LevelSchedulerProvider } from './LevelSchedulerProvider';
import { MainStateProvider } from './MainStateProvider';
import { ModStoreProvider } from './ModStoreProvider';

export function SEALContextProvider({ children }: PropsWithChildren<object>) {
    return (
        <ModStoreProvider>
            <LevelSchedulerProvider>
                <MainStateProvider>{children}</MainStateProvider>
            </LevelSchedulerProvider>
        </ModStoreProvider>
    );
}
