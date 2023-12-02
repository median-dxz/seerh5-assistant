import { Stack } from '@mui/system';
import React from 'react';

import { Header } from './header';
import { ModList } from './ModList';

export function ModManager() {
    return (
        <Stack>
            <Header />
            <ModList />
        </Stack>
    );
}
