import { useMainState } from '@/context/useMainState';
import { Button, Paper, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { produce } from 'immer';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BattleFireType, Engine, SEAEventSource, Socket, Subscription } from 'sea-core';

declare class FriendManager {
    static getFriendList(): Promise<{ itemSend: number }[]>;
}

type BattleFireInfo = Awaited<ReturnType<typeof Engine.updateBattleFireInfo>>;

const timeFormatter = (n: number) => {
    const { format } = Intl.NumberFormat(undefined, {
        minimumIntegerDigits: 2,
    });
    return `${format(Math.trunc(n / 60))}:${format(n % 60)}`;
};

const { setInterval } = window;

export function BattleFire() {
    const [battleFire, setBattleFire] = useState<BattleFireInfo>({ valid: false, timeLeft: 0 } as BattleFireInfo);
    const timer = useRef<null | number>(null);

    const update = async () => {
        const i = await Engine.updateBattleFireInfo();

        setBattleFire(i);
        if (!i.valid || i.timeLeft <= 0) return;
        if (timer.current) clearInterval(timer.current);

        timer.current = setInterval(() => {
            setBattleFire(
                produce((draft) => {
                    if (draft.timeLeft > 0) {
                        draft.timeLeft -= 1;
                    } else {
                        draft.valid = false;
                        if (timer.current) {
                            clearInterval(timer.current);
                            timer.current = null;
                        }
                    }
                })
            );
        }, 1000);
    };

    useEffect(() => {
        update();
        const sub = new Subscription();
        sub.on(SEAEventSource.egret('battleFireUpdateInfo'), update);
        return () => {
            sub.dispose();
        };
    }, []);

    let renderProps: { color: string; text: string };
    const { timeLeft } = battleFire;
    if (battleFire.valid) {
        switch (battleFire.type) {
            case BattleFireType.绿火:
                renderProps = { color: 'green', text: `绿火 ${timeFormatter(timeLeft)}` };
                break;
            case BattleFireType.金火:
                renderProps = { color: 'gold', text: `金火 ${timeFormatter(timeLeft)}` };
                break;
            default:
                renderProps = { color: 'inherit', text: '其他火焰' };
                break;
        }
    } else {
        renderProps = { color: 'inherit', text: '无火焰' };
    }

    const { setOpen } = useMainState();
    const exchangeBattleFire = useCallback(() => {
        ModuleManager.showModule('battleFirePanel', ['battleFirePanel'], null, null, AppDoStyle.NULL);
        setOpen(false);
    }, [setOpen]);

    const giftStars = useCallback(async () => {
        // 可用的每日赠送次数
        const remainingGifts = 20 - (await Socket.multiValue(12777))[0];

        FriendManager.getFriendList().then(function (e) {
            for (var n = [], r = new egret.ByteArray(), a = 0; a < e.length; a++)
                0 == e[a].itemSend && n.length < i && n.push(e[a].id);
            var r = new egret.ByteArray();
            r.writeUnsignedInt(n.length);
            for (var o = 0; o < n.length; o++) r.writeUnsignedInt(n[o]);
            SocketConnection.sendByQueue(47348, [4, 0, r], function (e) {
                var i = e.data;
                n = i.readUnsignedInt();
                r = i.readUnsignedInt();
                t.showTxt(n, r);
            });
        });
    }, []);

    return (
        <Paper sx={{ p: 4, height: '100%', flexDirection: 'column', alignItems: 'baseline' }}>
            <Typography fontWeight="bold" fontFamily={['Noto Sans SC', 'sans-serif']}>
                火焰信息
            </Typography>
            <Stack flexDirection="row" alignItems="center" justifyContent="space-between" width={'100%'}>
                <Typography color={renderProps.color}>{renderProps.text}</Typography>
                <Stack flexDirection="row">
                    <Button onClick={giftStars}>互送星星</Button>
                    <Button onClick={exchangeBattleFire}>兑换</Button>
                </Stack>
            </Stack>
        </Paper>
    );
}
