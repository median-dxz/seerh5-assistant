import { Paper } from '@/components/styled/Paper';
import { Row } from '@/components/styled/Row';
import { DS } from '@/constants';
import { useMainState } from '@/context/useMainState';
import { Button, CircularProgress, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { BattleFireType, SEAEventSource, Subscription, engine, socket, throttle } from '@sea/core';
import { produce } from 'immer';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import type { SWRSubscriptionOptions } from 'swr/subscription';
import useSWRSubscription from 'swr/subscription';

declare class FriendManager {
    static getFriendList(): Promise<{ itemSend: number; id: number }[]>;
}

type BattleFireInfo = Awaited<ReturnType<typeof engine.updateBattleFireInfo>>;

const timeFormatter = (n: number) => {
    const { format } = Intl.NumberFormat(undefined, {
        minimumIntegerDigits: 2,
    });
    return `${format(Math.trunc(n / 60))}:${format(n % 60)}`;
};

const { setInterval } = window;

export function BattleFire() {
    const { enqueueSnackbar } = useSnackbar();
    const { data: battleFire } = useSWRSubscription(
        DS.multiValue.battleFire,
        (_, { next }: SWRSubscriptionOptions<BattleFireInfo, Error>) => {
            let timer: null | number = null;
            const update = async () => {
                const i = await engine.updateBattleFireInfo();

                next(null, i);
                if (!i.valid || i.timeLeft <= 0) return;
                timer && clearInterval(timer);

                timer = setInterval(() => {
                    next(
                        null,
                        produce((draft) => {
                            if (draft.timeLeft > 0) {
                                draft.timeLeft -= 1;
                            } else {
                                draft.valid = false;
                                timer && clearInterval(timer);
                                timer = null;
                            }
                        })
                    );
                }, 1000);
            };

            const sub = new Subscription();
            sub.on(SEAEventSource.egret('battleFireUpdateInfo'), update);
            engine.updateBattleFireInfo().then((data) => next(null, data));

            return () => {
                sub.dispose();
            };
        },
        { fallbackData: { valid: false, timeLeft: 0 } as BattleFireInfo }
    );

    const [giftingStars, setGiftingStars] = useState(false);

    let renderProps: { color: string; text: string };
    const { timeLeft, valid, type } = battleFire!;
    if (valid) {
        switch (type) {
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
    const exchangeBattleFire = () => {
        ModuleManager.showModule('battleFirePanel', ['battleFirePanel'], null, null, AppDoStyle.NULL);
        setOpen(false);
    };

    const giftStars = async () => {
        if (giftingStars) return;

        // 可用的每日赠送次数
        const remainingGifts = 20 - (await socket.multiValue(12777))[0];
        if (remainingGifts <= 0) {
            enqueueSnackbar({
                variant: 'warning',
                message: '今日赠送次数已用完',
                onClose() {
                    setGiftingStars(false);
                },
            });
            return;
        }

        setGiftingStars(true);
        FriendManager.getFriendList()
            .then((friendsList) => {
                friendsList = friendsList.filter((friend) => friend.itemSend === 0).slice(0, remainingGifts);

                const buf = new egret.ByteArray();
                buf.writeUnsignedInt(friendsList.length);

                friendsList.forEach((friend) => {
                    buf.writeUnsignedInt(friend.id);
                });

                return socket.sendByQueue(47348, [4, 0, buf]);
            })
            .then((r) => {
                const buf = new egret.ByteArray(r);
                const received = buf.readUnsignedInt();
                const sent = buf.readUnsignedInt();
                enqueueSnackbar({
                    variant: 'info',
                    message: `获得${received}个星星, 送出${sent}个星星`,
                    onClose() {
                        setGiftingStars(false);
                    },
                });
            });
    };

    const throttledGiftStars = throttle(giftStars, 1500);

    return (
        <Paper>
            <Typography variant="subtitle1" fontSize="1em">
                火焰信息
            </Typography>
            <Row justifyContent="space-between">
                <Typography color={renderProps.color}>{renderProps.text}</Typography>
                <Stack flexDirection="row">
                    <Button onClick={throttledGiftStars}>
                        {giftingStars ? <CircularProgress size={16} /> : '互送星星'}
                    </Button>
                    <Button onClick={exchangeBattleFire}>兑换</Button>
                </Stack>
            </Row>
        </Paper>
    );
}
