import { Box, LinearProgress } from '@mui/material';
import React from 'react';

export const Loading = () => (
    <Box
        sx={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'stretch',
            flexDirection: 'column',
        }}
    >
        <LinearProgress />
    </Box>
);
