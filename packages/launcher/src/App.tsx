import { CssBaseline } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { DataSource, Hook, Subscription } from 'sea-core';

import { SEALContextProvider } from '@/context/SEALContextProvider';

import { Main } from '@/views/Main';
import { MainButton } from '@/views/Main/MainButton';

export default function App() {
    const [commandOpen, toggleCommandOpen] = useState(false);
    const [fighting, toggleFighting] = useState(false);

    const handleShortCut = (e: KeyboardEvent) => {
        if (e.key === 'p' && e.ctrlKey) {
            toggleCommandOpen((preState) => !preState);
            e.preventDefault();
        }
    };

    useEffect(() => {
        // 注册全局快捷键
        document.body.addEventListener('keydown', handleShortCut);

        // 监听战斗状态变化
        const sub = new Subscription();
        sub.on(DataSource.hook(Hook.Battle.battleStart), () => {
            toggleFighting(true);
        });
        sub.on(DataSource.hook(Hook.Battle.battleEnd), () => {
            toggleFighting(false);
        });

        return () => {
            document.body.removeEventListener('keydown', handleShortCut);
            sub.dispose();
        };
    }, []);

    return (
        <SEALContextProvider>
            <CssBaseline />
            {/* {!fighting && <QuickAccess />} */}
            {/* <Grow in={commandOpen} unmountOnExit>
                <Command />
            </Grow> */}
            <MainButton />
            <Main />
        </SEALContextProvider>
    );
}
