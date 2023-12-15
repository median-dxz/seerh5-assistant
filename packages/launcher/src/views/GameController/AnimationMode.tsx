import { Paper, Stack, Switch, Typography } from '@mui/material';
import React from 'react';

export function AnimationMode() {
    const [animationMode, setAnimationMode] = React.useState(false);

    React.useEffect(() => {
        const fightMode = window.localStorage.getItem('fight_mode');
        setAnimationMode(fightMode === '0');
    }, [animationMode]);

    const handleToggleMode = React.useCallback(
        (e: React.ChangeEvent, checked: boolean) => {
            FightManager.fightAnimateMode = Number(!checked);
            setAnimationMode(checked);
        },
        [setAnimationMode]
    );

    return (
        <Paper sx={{ p: 4, height: '100%', flexDirection: 'column', alignItems: 'baseline' }}>
            <Stack flexDirection="row" alignItems="center" justifyContent="space-between" width={'100%'}>
                <Typography>动画模式</Typography>
                <Switch
                    checked={animationMode}
                    onChange={handleToggleMode}
                    inputProps={{ 'aria-label': 'switch animation mode' }}
                />
            </Stack>
        </Paper>
    );
}
