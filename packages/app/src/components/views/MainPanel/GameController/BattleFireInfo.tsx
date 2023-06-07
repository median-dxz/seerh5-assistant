import { Button, Typography } from '@mui/material';
import { PanelStateContext } from '@sa-app/context/PanelState';
import React from 'react';
import { BattleFireType, updateBattleFireInfo } from 'sa-core';

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

    const updateBattleFire = React.useCallback(() => {
        updateBattleFireInfo().then((i) => setBattleFire(i));
    }, []);

    React.useEffect(updateBattleFire, [updateBattleFire]);

    React.useEffect(() => {
        setTimeLeft(battleFire.timeLeft);
        if (battleFire.timeLeft <= 0 || battleFire.valid === false) {
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 0) updateBattleFire();
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [battleFire, updateBattleFire]);

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
