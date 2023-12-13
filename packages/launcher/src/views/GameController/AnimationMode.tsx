import { Switch, Typography } from '@mui/material';
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
        <Typography variant="subtitle1" fontWeight={'bold'} fontFamily={['sans-serif']} pl={4}>
            动画模式
            <Switch checked={animationMode} onChange={handleToggleMode} />
        </Typography>
    );
}
