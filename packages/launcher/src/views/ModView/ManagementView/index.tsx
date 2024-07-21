import { Stack } from '@mui/material';
import React from 'react';

import { Header } from './Header';
import { ModList } from './ModList';

export function ManagementView() {
    return (
        <Stack>
            <Header />
            <ModList />
        </Stack>
    );
}
