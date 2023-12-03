import { Stack } from '@mui/material';
import React from 'react';
import { LevelList } from './LevelList';
import { Header } from './Header';

export function LevelView() {
    return (
        <Stack>
            <Header />
            <LevelList />
        </Stack>
    );
}
