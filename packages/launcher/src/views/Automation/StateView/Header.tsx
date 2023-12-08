import { useLevelScheduler } from '@/context/useLevelScheduler';
import { FormControlLabel, Stack, Switch, TextField, Typography } from '@mui/material';
import React, { useCallback } from 'react';

export function Header() {
    const { isPaused, pause, resume, status } = useLevelScheduler();

    const handlePauseScheduler = useCallback(() => {
        if (isPaused) {
            resume();
        } else {
            pause();
        }
    }, [isPaused, pause, resume]);

    return (
        <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{
                '&>*': {
                    p: 2,
                },
            }}
        >
            <Typography>LevelScheduler status: {status}</Typography>
            <FormControlLabel
                control={
                    <Switch
                        checked={isPaused}
                        onChange={handlePauseScheduler}
                        inputProps={{ 'aria-label': 'controlled' }}
                    />
                }
                label="暂停"
            />
            <TextField inputProps={{ sx: { height: '1em' } }}>搜索</TextField>
        </Stack>
    );
}
