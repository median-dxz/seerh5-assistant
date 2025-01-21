import { Paper } from '@/components/Paper';
import { Row } from '@/components/Row';
import { Switch, Typography } from '@mui/material';
import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';

export function AnimationMode() {
    const [animationMode, setAnimationMode] = useState(false);

    useEffect(() => {
        const fightMode = localStorage.getItem('fight_mode');
        setAnimationMode(fightMode === '0' || fightMode === null);
    }, [animationMode]);

    const handleToggleMode = (_: ChangeEvent, checked: boolean) => {
        FightManager.fightAnimateMode = Number(!checked);
        setAnimationMode(checked);
    };

    return (
        <Paper sx={{ p: 4 }}>
            <Row
                sx={{
                    justifyContent: 'space-between'
                }}
            >
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
