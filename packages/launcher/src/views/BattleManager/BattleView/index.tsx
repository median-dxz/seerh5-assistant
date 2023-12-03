import { Stack } from '@mui/material';
import React from 'react';
import { BattleList } from './BattleList';
import { Header } from './Header';

export function BattleView() {
    return (
        <Stack>
            <Header />
            <BattleList />
        </Stack>
    );
}
