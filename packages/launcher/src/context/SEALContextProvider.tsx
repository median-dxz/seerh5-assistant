import { cache } from '@emotion/css';
import { CacheProvider } from '@emotion/react';
import { MaterialDesignContent, SnackbarProvider } from 'notistack';
import React, { type PropsWithChildren } from 'react';

import { theme } from '@/style';
import { ThemeProvider, alpha, styled } from '@mui/material';

import { SWRConfig, type SWRConfiguration } from 'swr';
import { LevelSchedulerProvider } from './LevelSchedulerProvider';
import { MainStateProvider } from './MainStateProvider';
import { ModStoreProvider } from './ModStoreProvider';

const StyledMaterialDesignContent = styled(MaterialDesignContent)`
    &.notistack-MuiContent-default {
        background-color: ${alpha(theme.palette.secondary.main, 0.6)};
        backdrop-filter: blur(6px);
    }
`;

export function SEALContextProvider({ children }: PropsWithChildren<object>) {
    const swrOptions: SWRConfiguration = {};
    return (
        <CacheProvider value={cache}>
            <ThemeProvider theme={theme}>
                <SWRConfig value={swrOptions}>
                    <SnackbarProvider
                        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
                        autoHideDuration={1500}
                        disableWindowBlurListener
                        maxSnack={1}
                        Components={{ default: StyledMaterialDesignContent }}
                    >
                        <ModStoreProvider>
                            <LevelSchedulerProvider>
                                <MainStateProvider>{children}</MainStateProvider>
                            </LevelSchedulerProvider>
                        </ModStoreProvider>
                    </SnackbarProvider>
                </SWRConfig>
            </ThemeProvider>
        </CacheProvider>
    );
}
