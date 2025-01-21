import { Box, Fade, styled } from '@mui/material';

import { initializer } from '@/features/initializer';
import { useAppSelector } from '@/shared';

import { CoreLoadingScreen } from './CoreLoadingScreen';
import { ErrorScreen } from './ErrorScreen';
import { LoginLoadingScreen } from './LoginLoadingScreen';

const Container = styled(Box)`
    position: relative;
    display: flex;
    z-index: 1;
    width: 100vw;
    height: 100vh;
    flex-direction: column;
    align-items: center;
    justify-content: center;
` as typeof Box;

export function InitializationView() {
    const status = useAppSelector(initializer.status);

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
