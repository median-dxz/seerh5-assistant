import { Paper } from '@/components/styled/Paper';
import { Row } from '@/components/styled/Row';
import { QueryKey } from '@/constants';
import { mainPanelActions } from '@/services/mainPanelSlice';
import { time2mmss } from '@/shared/index';
import { useAppDispatch } from '@/store';
import { Button, CircularProgress, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { BattleFireType, SEAEventSource, Subscription, engine, socket, throttle } from '@sea/core';
import { produce } from 'immer';
import { useSnackbar } from 'notistack';
import React, { useRef, useState } from 'react';
import type { SWRSubscriptionOptions } from 'swr/subscription';
import useSWRSubscription from 'swr/subscription';

declare class FriendManager {
    static getFriendList(): Promise<Array<{ itemSend: number; id: number }>>;
}

type BattleFireInfo = Awaited<ReturnType<typeof engine.updateBattleFireInfo>>;

const { setInterval } = window;

export function BattleFire() {
    const { enqueueSnackbar } = useSnackbar();
    const timer = useRef<null | number>(null);
    const { data: battleFire } = useSWRSubscription(
        QueryKey.multiValue.battleFire,
        (_, { next }: SWRSubscriptionOptions<BattleFireInfo, Error>) => {
            const update = async () => {
                const i = await engine.updateBattleFireInfo();

                next(null, i);
                if (!i.valid || i.timeLeft <= 0) return;
                timer.current && clearInterval(timer.current);

                timer.current = setInterval(() => {
                    next(null, (currentData) => {
                        if (currentData && currentData.timeLeft === 0) {
                            timer.current && clearInterval(timer.current);
                            timer.current = null;
                        }

                        return produce(currentData, (draft) => {
                            if (!draft) return;
                            if (draft.timeLeft > 0) {
                                draft.timeLeft -= 1;
                            } else {
                                draft.valid = false;
                            }
                        });
                    });
                }, 1000);
            };

            const sub = new Subscription();
            sub.on(SEAEventSource.egret('battleFireUpdateInfo'), update);
            void update();

            return () => {
                sub.dispose();
                timer.current && clearInterval(timer.current);
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
                renderProps = { color: 'green', text: `绿火 ${time2mmss(timeLeft * 1000)}` };
                break;
            case BattleFireType.金火:
                renderProps = { color: 'gold', text: `金火 ${time2mmss(timeLeft * 1000)}` };
                break;
            default:
                renderProps = { color: 'inherit', text: '其他火焰' };
                break;
        }
    } else {
        renderProps = { color: 'inherit', text: '无火焰' };
    }

    const dispatch = useAppDispatch();
    const exchangeBattleFire = () => {
        void ModuleManager.showModule('battleFirePanel', ['battleFirePanel'], null, null, AppDoStyle.NULL);
        dispatch(mainPanelActions.close());
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
                }
            });
            return;
        }

        setGiftingStars(true);
        let friendsList = await FriendManager.getFriendList();
        friendsList = friendsList.filter((friend) => friend.itemSend === 0).slice(0, remainingGifts);

        let buf = new egret.ByteArray();
        buf.writeUnsignedInt(friendsList.length);

        friendsList.forEach((friend) => {
            buf.writeUnsignedInt(friend.id);
        });

        buf = new egret.ByteArray(await socket.sendByQueue(47348, [4, 0, buf]));

        const received = buf.readUnsignedInt();
        const sent = buf.readUnsignedInt();
        enqueueSnackbar({
            variant: 'info',
            message: `获得${received}个星星, 送出${sent}个星星`,
            onClose() {
                setGiftingStars(false);
            }
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
