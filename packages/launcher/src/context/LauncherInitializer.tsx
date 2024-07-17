import { useAppSelector } from '@/store';
import { CoreLoadingScreen } from '@/views/InitializationView/CoreLoadingScreen';
import { ErrorScreen } from '@/views/InitializationView/ErrorScreen';
import { LoginLoadingScreen } from '@/views/InitializationView/LoginLoadingScreen';
import { Box, Fade, Grow } from '@mui/material';
import type { BoxProps } from '@mui/system';
import { forwardRef, type PropsWithChildren } from 'react';

const Container = forwardRef<HTMLDivElement, BoxProps>(function ({ sx, ...props }, ref) {
    return (
        <Box
            ref={ref}
            sx={{
                ...sx,
                position: 'relative',
                display: 'flex',
                zIndex: 1,
                width: '100vw',
                height: '100vh',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            {...props}
        />
    );
});

export function LauncherInitializer({ children }: PropsWithChildren<object>) {
    const status = useAppSelector((state) => state.initialization.status);

    switch (status) {
        case 'beforeGameCoreInit':
        case 'waitingForLogin':
            return (
                <Fade timeout={1200} appear={false} in={status === 'beforeGameCoreInit'} unmountOnExit>
                    <Container sx={{ bgcolor: '#fff' }}>
                        <CoreLoadingScreen />
                    </Container>
                </Fade>
            );
        case 'afterFirstShowMainPanel':
        case 'fulfilled':
            return (
                <>
                    <Grow timeout={1200} in={status === 'afterFirstShowMainPanel'} unmountOnExit>
                        <Container>
                            <LoginLoadingScreen />
                        </Container>
                    </Grow>
                    {status === 'fulfilled' && children}
                </>
            );
        case 'error':
            return (
                <Container sx={{ bgcolor: '#fff' }}>
                    <ErrorScreen />
                </Container>
            );
    }
}
