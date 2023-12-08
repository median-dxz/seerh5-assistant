import React, { type PropsWithChildren } from 'react';

import { theme } from '@/style';
import { ThemeProvider } from '@mui/material';

import { SWRConfig, type SWRConfiguration } from 'swr';
import { LevelSchedulerProvider } from './LevelSchedulerProvider';
import { MainStateProvider } from './MainStateProvider';
import { ModStoreProvider } from './ModStoreProvider';

export function SEALContextProvider({ children }: PropsWithChildren<object>) {
    const swrOptions: SWRConfiguration = {};
    return (
        <ThemeProvider theme={theme}>
            <SWRConfig value={swrOptions}>
                <ModStoreProvider>
                    <LevelSchedulerProvider>
                        <MainStateProvider>{children}</MainStateProvider>
                    </LevelSchedulerProvider>
                </ModStoreProvider>
            </SWRConfig>
        </ThemeProvider>
    );
}
