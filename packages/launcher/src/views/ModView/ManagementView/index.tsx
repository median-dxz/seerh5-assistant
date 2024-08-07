import { Stack } from '@mui/material';

import { Header } from './Header';
import { ModList } from './ModList';

export function ManagementView() {
    return (
        <Stack spacing={0}>
            <Header />
            <ModList />
        </Stack>
    );
}
