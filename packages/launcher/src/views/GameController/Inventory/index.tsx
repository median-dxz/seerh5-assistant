import { Divider, Paper, Stack } from '@mui/material';
import React from 'react';

import { EyeEquipmentSelector } from './EyeEquipmentSelector';
import { SuitSelector } from './SuitSelector';
import { TitleSelector } from './TitleSelector';

export function Inventory() {
    return (
        <Paper
            sx={{
                p: 4,
                height: '100%',
            }}
        >
            <Stack sx={{ width: '100%' }} spacing={2} justifyContent={'space-around'}>
                <TitleSelector />
                <Divider />
                <SuitSelector />
                <Divider />
                <EyeEquipmentSelector />
            </Stack>
        </Paper>
    );
}
