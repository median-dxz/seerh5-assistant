import { Backdrop, alpha } from '@mui/material';
import React, { type PropsWithChildren } from 'react';

import { useMainState } from '@/context/useMainState';

import { TabRouterProvider } from '@/context/TabRouterProvider';
import { root } from '../root';
import { TabView } from './TabView';

const MainBackdrop = ({ open, children }: PropsWithChildren<{ open: boolean }>) => (
    <Backdrop
        open={open}
        sx={{
            bgcolor: alpha('#000', 0.75),
            backdropFilter: 'blur(12px)',
            zIndex: (theme) => theme.zIndex.appBar - 1,
        }}
    >
        {children}
    </Backdrop>
);

export function Main() {
    const { open } = useMainState();
    return (
        <MainBackdrop open={open}>
            <TabRouterProvider rootView={root}>
                <TabView />
            </TabRouterProvider>
        </MainBackdrop>
    );
}
