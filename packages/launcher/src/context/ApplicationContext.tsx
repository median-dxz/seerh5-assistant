import { theme } from '@/style';
import { cache } from '@emotion/css';
import { CacheProvider } from '@emotion/react';
import { CssBaseline, ThemeProvider, alpha, styled } from '@mui/material';
import { enableMapSet } from 'immer';
import { MaterialDesignContent, SnackbarProvider } from 'notistack';
import React, { type PropsWithChildren } from 'react';
import { SWRConfig, type SWRConfiguration } from 'swr';
import { ModStoreProvider } from './ModStoreProvider';

const StyledMaterialDesignContent = styled(MaterialDesignContent)`
    &.notistack-MuiContent-default {
        background-color: ${alpha(theme.palette.secondary.main, 0.6)};
        backdrop-filter: blur(6px);
    }
`;

enableMapSet();

export function ApplicationContext({ children }: PropsWithChildren<object>) {
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
                        <CssBaseline />
                        <ModStoreProvider>{children}</ModStoreProvider>
                    </SnackbarProvider>
                </SWRConfig>
            </ThemeProvider>
        </CacheProvider>
    );
}
