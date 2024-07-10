import { Box, LinearProgress, type BoxProps } from '@mui/material';
import React from 'react';

export const Loading = ({ sx }: BoxProps) => (
    <Box
        sx={{
            ...sx,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'stretch',
            flexDirection: 'column'
        }}
    >
        <LinearProgress />
    </Box>
);
