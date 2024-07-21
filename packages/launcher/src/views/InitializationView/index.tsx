import { useAppSelector } from '@/store';
import { CoreLoadingScreen } from '@/views/InitializationView/CoreLoadingScreen';
import { ErrorScreen } from '@/views/InitializationView/ErrorScreen';
import { LoginLoadingScreen } from '@/views/InitializationView/LoginLoadingScreen';
import { Box, Fade, type BoxProps } from '@mui/material';
import { forwardRef } from 'react';

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

export function InitializationView() {
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
                <Fade timeout={600} in={status === 'afterFirstShowMainPanel'} unmountOnExit>
                    <Container>
                        <LoginLoadingScreen />
                    </Container>
                </Fade>
            );
        case 'error':
            return (
                <Container sx={{ bgcolor: '#fff' }}>
                    <ErrorScreen />
                </Container>
            );
    }
}
