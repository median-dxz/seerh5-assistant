import type { StackProps } from '@mui/material';
import { Stack } from '@mui/material';
import React from 'react';

export function Row({ children, ...props }: StackProps) {
    return (
        <Stack
            sx={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
            }}
            justifyContent="start"
            {...props}
        >
            {children}
        </Stack>
    );
}
