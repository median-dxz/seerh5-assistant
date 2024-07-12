import ElectricBolt from '@mui/icons-material/ElectricBolt';
import { Backdrop, alpha, type ButtonProps } from '@mui/material';
import React, { type PropsWithChildren } from 'react';

import { HexagonalButton } from '@/components/styled/HexagonalButton';
import { TabRouterProvider } from '@/context/TabRouterProvider';
import { mainPanelActions } from '@/services/mainPanelSlice';
import { useAppDispatch, useAppSelector } from '@/store';
import { root } from '../root';
import { TabView } from './TabView';

export function Main() {
    const dispatch = useAppDispatch();
    const open = useAppSelector((state) => state.mainPanel.open);

    return (
        <>
            <MainButton
                baseSize={28}
                sx={{ top: '64px', left: '64px', position: 'absolute', zIndex: (theme) => theme.zIndex.appBar }}
                onClick={() => dispatch(mainPanelActions.toggle())}
            />
            <MainBackdrop open={open}>
                <TabRouterProvider rootView={root}>
                    <TabView />
                </TabRouterProvider>
            </MainBackdrop>
        </>
    );
}

const MainBackdrop = ({ open, children }: PropsWithChildren<{ open: boolean }>) => (
    <Backdrop
        open={open}
        sx={{
            bgcolor: alpha('#000', 0.75),
            backdropFilter: 'blur(12px)',
            zIndex: (theme) => theme.zIndex.appBar - 1
        }}
    >
        {children}
    </Backdrop>
);

export function MainButton({ baseSize, ...props }: ButtonProps & { baseSize: number }) {
    return (
        <HexagonalButton baseSize={baseSize} {...props}>
            <ElectricBolt />
        </HexagonalButton>
    );
}
