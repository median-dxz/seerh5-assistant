import { Switch, Typography } from '@mui/material';
import React, { useEffect, useState, type ChangeEvent } from 'react';
import { Paper } from './styled/Paper';
import { Row } from './styled/Row';

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
        <Paper>
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
