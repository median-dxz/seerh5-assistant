import { Stack } from '@mui/material';
import React from 'react';
import { Header } from './Header';
import { StrategyList } from './StrategyList';

export function StrategyView() {
    return (
        <Stack>
            <Header />
            <StrategyList />
        </Stack>
    );
}
