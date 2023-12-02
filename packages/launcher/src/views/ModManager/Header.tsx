import { Box, Button, Switch, Typography, alpha } from '@mui/material';
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
            <Typography>开发挂载目录:</Typography>
            <Button id="mod-manager-dev-watch-path" variant="outlined">
                some/path/to/dev
            </Button>
            <Typography>模组目录:</Typography>
            <Button id="mod-manager-mount-path" variant="outlined">
                some/path/to/dev
            </Button>
            <Switch aria-label="DevMode" />
            <Button>重载所有模组</Button>
        </Box>
    );
}
