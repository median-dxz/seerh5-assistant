import { DS } from '@/constants';
import { CircularProgress, Paper, Stack, Switch, Typography } from '@mui/material';
import React, { useCallback, type ChangeEvent } from 'react';
import { Engine } from 'sea-core/engine';
import useSWR from 'swr';

export function AutoCureState() {
    const { data: autoCure, mutate: setAutoCure } = useSWR(DS.state.autoCure, Engine.autoCureState);

    const handleToggleMode = useCallback(
        (e: ChangeEvent, checked: boolean) => {
            setAutoCure(async () => {
                await Engine.toggleAutoCure(checked);
                return Engine.autoCureState();
            });
        },
        [setAutoCure]
    );

    return (
        <Paper sx={{ p: 4, height: '100%', flexDirection: 'column', alignItems: 'baseline' }}>
            <Stack flexDirection="row" alignItems="center" justifyContent="space-between" width={'100%'}>
                <Typography>自动治疗</Typography>
                {autoCure != undefined ? (
                    <Switch
                        checked={autoCure}
                        onChange={handleToggleMode}
                        inputProps={{ 'aria-label': 'switch auto cure state' }}
                    />
                ) : (
                    <CircularProgress />
                )}
            </Stack>
        </Paper>
    );
}