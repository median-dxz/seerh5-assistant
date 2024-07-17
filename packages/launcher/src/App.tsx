import { launcherSelectors } from '@/features/launcherSlice';
import { useAppSelector } from '@/store';
import { Command } from '@/views/Command';
import { Main } from '@/views/Main';
import { QuickAccess } from '@/views/QuickAccess';
import { Grow } from '@mui/material';
import React from 'react';

export default function Launcher() {
    const isFighting = useAppSelector(launcherSelectors.selectIsFighting);
    const commandOpen = useAppSelector(launcherSelectors.selectCommandOpen);

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
                        zIndex: (theme) => theme.zIndex.snackbar
                    }}
                />
            </Grow>
            <Main />
        </>
    );
}
