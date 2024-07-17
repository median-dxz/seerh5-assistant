import { Paper } from '@/components/styled/Paper';
import { Row } from '@/components/styled/Row';
import { gameApi } from '@/services/game';
import { CircularProgress, Switch, Typography } from '@mui/material';
import { engine } from '@sea/core';
import type { ChangeEvent } from 'react';
import React from 'react';

export function AutoCureState() {
    const { data: autoCure = false, isLoading } = gameApi.useAutoCureQuery();

    const handleToggleMode = (_: ChangeEvent, checked: boolean) => {
        void engine.toggleAutoCure(checked);
    };

    return (
        <Paper>
            <Row justifyContent="space-between">
                <Typography>自动治疗</Typography>
                {!isLoading ? (
                    <Switch
                        checked={autoCure}
                        onChange={handleToggleMode}
                        inputProps={{ 'aria-label': 'switch auto cure state' }}
                    />
                ) : (
                    <CircularProgress />
                )}
            </Row>
        </Paper>
    );
}
