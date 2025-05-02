import { Fade } from '@mui/material';

import { ScreenContainer } from '@/components/ScreenContainer';
import { initializer } from '@/features/initializer';
import { useAppSelector } from '@/shared';
import { ErrorScreen } from '@/views/ErrorScreen';

import { CoreLoadingScreen } from './CoreLoadingScreen';
import { LoginLoadingScreen } from './LoginLoadingScreen';

export function InitializationView() {
    const status = useAppSelector(initializer.status);
    const loadingText = useAppSelector(initializer.loadingText);
    switch (status) {
        case 'beforeGameCoreInit':
        case 'waitingForLogin':
            return (
                <Fade timeout={1200} appear={false} in={status === 'beforeGameCoreInit'} unmountOnExit>
                    <ScreenContainer sx={{ bgcolor: '#fff' }}>
                        <CoreLoadingScreen loadingText={loadingText} />
                    </ScreenContainer>
                </Fade>
            );
        case 'afterFirstShowMainPanel':
        case 'fulfilled':
            return (
                <Fade timeout={600} in={status === 'afterFirstShowMainPanel'} unmountOnExit>
                    <ScreenContainer>
                        <LoginLoadingScreen loadingText={loadingText} />
                    </ScreenContainer>
                </Fade>
            );
        case 'rejected':
            return <ErrorScreen error={loadingText} />;
    }
}
