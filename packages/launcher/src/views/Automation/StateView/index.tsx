import { Box, Grid, useMediaQuery, useTheme } from '@mui/material';
import React from 'react';
import { LevelStateList } from './LevelStateList';
import { Sidebar } from './Sidebar';

const sidebarHeight = '156px';

export function StateView() {
    const theme = useTheme();
    const matchMd = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <Grid container pt={3} pb={3} flexDirection="row-reverse">
            <Grid item container xs={12} md={4}>
                <Box width="100%" height={sidebarHeight} mb={3} mr={matchMd ? 0 : 2} ml={matchMd ? 2 : 0}>
                    <Sidebar height={sidebarHeight} />
                </Box>
            </Grid>
            <Grid item xs={12} md={8}>
                <LevelStateList
                    disablePadding
                    sx={{
                        width: '100%',
                        maxHeight: matchMd ? 'calc(100vh - 36px)' : `calc(100vh - 36px - 140px)`,
                        overflow: 'auto',
                        paddingRight: 1,
                        '& > *:not(:first-child)': { marginTop: '8px' },
                    }}
                />
            </Grid>
        </Grid>
    );
}
