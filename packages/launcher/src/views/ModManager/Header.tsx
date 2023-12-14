import { Box, Button, alpha } from '@mui/material';
import React from 'react';

export function Header() {
    return (
        <Box
            sx={{
                display: 'flex',
                height: '56px',
                width: '100%',
                justifyContent: 'space-evenly',
                padding: '0 16px',
                alignItems: 'center',
                borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            }}
        >
            <Button>重载所有模组</Button>
        </Box>
    );
}
