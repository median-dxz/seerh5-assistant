import { appStore } from '@/store';
import { theme } from '@/style';
import { cache } from '@emotion/css';
import { CacheProvider } from '@emotion/react';
import { CssBaseline, ThemeProvider, alpha, styled } from '@mui/material';
import { enableMapSet } from 'immer';
import { MaterialDesignContent, SnackbarProvider } from 'notistack';
import React, { type PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { SWRConfig, type SWRConfiguration } from 'swr';

const StyledMaterialDesignContent = styled(MaterialDesignContent)`
    &.notistack-MuiContent-default {
        background-color: ${alpha(theme.palette.secondary.main, 0.6)};
        backdrop-filter: blur(4px);
    }
`;

export function ApplicationContext({ children }: PropsWithChildren<object>) {
    const swrOptions: SWRConfiguration = {};
    enableMapSet();
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
                        <Provider store={appStore}>{children}</Provider>
                    </SnackbarProvider>
                </SWRConfig>
            </ThemeProvider>
        </CacheProvider>
    );
}
