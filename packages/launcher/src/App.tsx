import { Grow } from '@mui/material';

import { initializer } from '@/features/initializer';
import { launcher } from '@/features/launcher';
import { useAppSelector } from '@/shared';
import { Command } from '@/views/Command';
import { Main } from '@/views/Main';
import { QuickAccess } from '@/views/QuickAccess';

export default function Launcher() {
    const { commandOpen, isFighting } = launcher.useSelectProps('commandOpen', 'isFighting');
    const status = useAppSelector(initializer.status);

    if (status !== 'fulfilled') return null;

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
