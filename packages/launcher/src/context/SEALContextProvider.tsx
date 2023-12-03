import React, { type PropsWithChildren } from 'react';

import { theme } from '@/style';
import { ThemeProvider } from '@mui/material';

import { SWRConfig, type SWRConfiguration } from 'swr';
import { MainStateProvider } from './MainStateProvider';
import { ModStoreProvider } from './ModStoreProvider';

export function SEALContextProvider({ children }: PropsWithChildren<object>) {
    const swrOptions: SWRConfiguration = {};
    return (
        <ThemeProvider theme={theme}>
            <SWRConfig value={swrOptions}>
                <ModStoreProvider>
                    <MainStateProvider>{children}</MainStateProvider>
                </ModStoreProvider>
            </SWRConfig>
        </ThemeProvider>
    );
}
