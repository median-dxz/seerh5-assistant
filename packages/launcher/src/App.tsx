import { CssBaseline, Grow } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { SEAEventSource, Subscription } from 'sea-core';

import { SEALContextProvider } from '@/context/SEALContextProvider';

import { ModLoader } from '@/service/mod/ModLoader';

import { Command } from '@/views/Command';
import { Main } from '@/views/Main';
import { QuickAccess } from '@/views/QuickAccess';

import { loader } from '@/init';

export default function App() {
    const [init, setInit] = useState(false);
    const [commandOpen, toggleCommandOpen] = useState(false);
    const [fighting, toggleFighting] = useState(false);

    const handleShortCut = (e: KeyboardEvent) => {
        if (e.key === 'p' && e.ctrlKey) {
            toggleCommandOpen((preState) => !preState);
            e.preventDefault();
        }
    };

    useEffect(() => {
        if (init) return;
        loader
            .load()
            .then(() => {
                setInit(true);
            })
            .catch((_) => {
                // React严格模式下导致的重复调用CoreLoader, 可以忽略
            });
    }, [init]);

    useEffect(() => {
        if (!init) return;
        // 注册全局快捷键
        document.body.addEventListener('keydown', handleShortCut);

        // 监听战斗状态变化
        const sub = new Subscription();
        sub.on(SEAEventSource.hook('battle:start'), () => {
            toggleFighting(true);
        });
        sub.on(SEAEventSource.hook('battle:end'), () => {
            toggleFighting(false);
        });

        return () => {
            document.body.removeEventListener('keydown', handleShortCut);
            sub.dispose();
        };
    }, [init]);

    if (!init) return null;

    return (
        <SEALContextProvider>
            <CssBaseline />
            <ModLoader />
            {!fighting && (
                <QuickAccess
                    ariaLabel="Seerh5 Assistant Quick Access"
                    sx={{
                        position: 'absolute',
                        bottom: '64px',
                        left: '64px',
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
                        zIndex: (theme) => theme.zIndex.snackbar,
                    }}
                />
            </Grow>
            <Main />
        </SEALContextProvider>
    );
}
