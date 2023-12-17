import type { StackProps } from '@mui/material';
import { Stack } from '@mui/material';
import React from 'react';

export function Row({ children, sx, ...props }: StackProps) {
    return (
        <Stack
            sx={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
                ...sx,
            }}
            justifyContent="start"
            {...props}
        >
            {children}
        </Stack>
    );
}
