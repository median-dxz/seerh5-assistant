import { Button, Typography } from '@mui/material';
import { PanelStateContext } from '@sa-app/context/PanelState';
import React from 'react';
import { BattleFireType, updateBattleFireInfo } from 'seerh5-assistant-core';

const timeFormatter = (n: number) => {
    const { format } = Intl.NumberFormat(undefined, {
        minimumIntegerDigits: 2,
    });
    return `${format(Math.trunc(n / 60))}:${format(n % 60)}`;
};

type BattleFireInfo = Awaited<ReturnType<typeof updateBattleFireInfo>>;

export function BattleFireInfo() {
    const [battleFire, setBattleFire] = React.useState<BattleFireInfo>({} as BattleFireInfo);
    const [timeLeft, setTimeLeft] = React.useState(0);
    const [timer, setTimer] = React.useState<undefined | number>(undefined);

    const updateBattleFire = React.useCallback(() => {
        updateBattleFireInfo().then((i) => setBattleFire(i));
    }, []);

    React.useEffect(() => {
        clearInterval(timer);
        setTimeLeft(battleFire.timeLeft);
        if (battleFire.timeLeft <= 0 || battleFire.valid === false) {
            setTimer(undefined);
        } else {
            const { setInterval } = window;
            const timerId = setInterval(() => {
                if (timeLeft <= 0) {
                    updateBattleFire();
                } else {
                    setTimeLeft((t) => t - 1);
                }
            }, 1000);
            setTimer(timerId);
        }
        return () => clearInterval(timer);
    }, [battleFire]);

    React.useEffect(updateBattleFire, []);

    let renderProps: { color: string; text: string };
    switch (true) {
        case !battleFire.valid:
            renderProps = { color: 'inherit', text: '无火焰' };
            break;
        case battleFire.type === BattleFireType.绿火:
            renderProps = { color: 'green', text: `使用中: 绿火 剩余时间: ${timeFormatter(timeLeft)}` };
            break;
        case battleFire.type === BattleFireType.金火:
            renderProps = { color: 'gold', text: `使用中: 金火 剩余时间: ${timeFormatter(timeLeft)}` };
            break;
        default:
            renderProps = { color: 'inherit', text: '其他火焰' };
            break;
    }

    const { open, setOpen } = React.useContext(PanelStateContext);
    const exchangeBattleFire = React.useCallback(() => {
        ModuleManager.showModule('battleFirePanel', ['battleFirePanel'], null, null, AppDoStyle.NULL);
        setOpen(false);
    }, [open]);

    return (
        <Typography color={renderProps.color}>
            {renderProps.text}
            <Button onClick={updateBattleFire}>刷新</Button>
            <Button onClick={exchangeBattleFire}>兑换</Button>
        </Typography>
    );
}
