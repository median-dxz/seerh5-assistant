import { Grow } from '@mui/material';
import { useEffect } from 'react';

import { initializer } from '@/features/initializer';
import { launcher } from '@/features/launcher';
import { useAppDispatch, useAppSelector } from '@/shared';
import { Command } from '@/views/Command';
import { InitializationView } from '@/views/InitializationView';
import { Main } from '@/views/Main';
import { QuickAccess } from '@/views/QuickAccess';

export default function Launcher() {
    const { commandOpen, isFighting } = launcher.useSelectProps('commandOpen', 'isFighting');
    const status = useAppSelector(initializer.status);
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(initializer.init());
    }, [dispatch]);

    if (status !== 'fulfilled') return <InitializationView />;

    return (
        <>
            {!isFighting && (
                <QuickAccess
                    ariaLabel="Seerh5 Assistant Quick Access"
                    sx={{
                        position: 'absolute',
                        bottom: '64px',
                        left: '64px'
                    }}
                />
            )}
            <Grow in={commandOpen} unmountOnExit>
                <Command
                    sx={{
                        position: 'absolute',
                        left: '30vw',
                        top: '64px',
                        width: '40vw',
                        minWidth: '240px',
                        zIndex: ({ zIndex }) => zIndex.modal - 1
                    }}
                />
            </Grow>
            <Main />
        </>
    );
}
