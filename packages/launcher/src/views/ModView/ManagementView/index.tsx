import { Stack } from '@mui/system';
import React from 'react';

import { ModList } from './ModList';
import { Header } from './Header';

export function ManagementView() {
    return (
        <Stack>
            <Header />
            <ModList />
        </Stack>
    );
}
