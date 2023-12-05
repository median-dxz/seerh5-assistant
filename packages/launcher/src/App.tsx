import { CssBaseline, Grow } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { EventSource, Hook, Subscription } from 'sea-core';

import { SEALContextProvider } from '@/context/SEALContextProvider';

import { ModLoader } from '@/service/mod/ModLoader';

import { Command } from '@/views/Command';
import { Main } from '@/views/Main';
import { MainButton } from '@/views/Main/MainButton';
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
        loader.load().then(() => {
            setInit(true);
        });
    }, [init]);

    useEffect(() => {
        if (!init) return;
        // 注册全局快捷键
        document.body.addEventListener('keydown', handleShortCut);

        // 监听战斗状态变化
        const sub = new Subscription();
        sub.on(EventSource.hook(Hook.Battle.battleStart), () => {
            toggleFighting(true);
        });
        sub.on(EventSource.hook(Hook.Battle.battleEnd), () => {
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
            {!fighting && <QuickAccess />}
            <Grow in={commandOpen} unmountOnExit>
                <Command />
            </Grow>
            <MainButton />
            <Main />
        </SEALContextProvider>
    );
}
