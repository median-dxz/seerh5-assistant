import { Row } from '@/components/styled/Row';
import { Paper, Switch, Typography } from '@mui/material';
import React, { useEffect, useState, type ChangeEvent } from 'react';

export function AnimationMode() {
    const [animationMode, setAnimationMode] = useState(false);

    useEffect(() => {
        const fightMode = window.localStorage.getItem('fight_mode');
        setAnimationMode(fightMode === '0' || fightMode === null);
    }, [animationMode]);

    const handleToggleMode = (_: ChangeEvent, checked: boolean) => {
        FightManager.fightAnimateMode = Number(!checked);
        setAnimationMode(checked);
    };

    return (
        <Paper sx={{ p: 4 }}>
            <Row justifyContent="space-between">
                <Typography>动画模式</Typography>
                <Switch
                    checked={animationMode}
                    onChange={handleToggleMode}
                    inputProps={{ 'aria-label': 'switch animation mode' }}
                />
            </Row>
        </Paper>
    );
}
