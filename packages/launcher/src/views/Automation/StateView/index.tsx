import { Stack } from '@mui/material';
import React from 'react';
import { Header } from './Header';
import { LevelStateList } from './LevelStateList';

export function StateView() {
    return (
        <Stack>
            <Header />
            <LevelStateList />
        </Stack>
    );
}
