import { appStore } from '@/store';
import { theme } from '@/theme';
import { cache } from '@emotion/css';
import { CacheProvider } from '@emotion/react';
import { CssBaseline, ThemeProvider, alpha, styled } from '@mui/material';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { enableMapSet } from 'immer';
import { MaterialDesignContent, SnackbarProvider } from 'notistack';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { Provider } from 'react-redux';

const StyledMaterialDesignContent = styled(MaterialDesignContent)`
    &.notistack-MuiContent-default {
        background-color: ${alpha(theme.palette.secondary.main, 0.6)};
        backdrop-filter: blur(4px);
    }
`;

export function ApplicationContext({ children }: PropsWithChildren<object>) {
    useEffect(() => {
        enableMapSet();
        dayjs.extend(duration);
    }, []);

    return (
        <CacheProvider value={cache}>
            <ThemeProvider theme={theme}>
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
            </ThemeProvider>
        </CacheProvider>
    );
}
