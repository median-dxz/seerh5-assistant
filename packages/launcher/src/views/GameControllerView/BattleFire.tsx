import { Row } from '@/components/styled/Row';
import { launcherActions } from '@/features/launcherSlice';
import { gameApi } from '@/services/game';
import { useAppDispatch } from '@/store';
import { Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { BattleFireType, socket, throttle } from '@sea/core';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';

declare class FriendManager {
    static getFriendList(): Promise<Array<{ itemSend: number; id: number }>>;
}

export function BattleFire() {
    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useAppDispatch();

    const { data: battleFire = { timeLeft: 0, valid: false, type: 0 } } = gameApi.useBattleFireQuery();

    const { timeLeft, valid, type } = battleFire;

    let renderProps: { color: string; text: string };

    if (valid) {
        switch (type as BattleFireType) {
            case BattleFireType.绿火:
                renderProps = { color: 'green', text: `绿火 ${dayjs.duration(timeLeft, 's').format('mm:ss')}` };
                break;
            case BattleFireType.金火:
                renderProps = { color: 'gold', text: `金火 ${dayjs.duration(timeLeft, 's').format('mm:ss')}` };
                break;
            default:
                renderProps = { color: 'inherit', text: '其他火焰' };
                break;
        }
    } else {
        renderProps = { color: 'inherit', text: '无火焰' };
    }

    const exchangeBattleFire = () => {
        void ModuleManager.showModule('battleFirePanel', ['battleFirePanel'], null, null, AppDoStyle.NULL);
        dispatch(launcherActions.closeMain());
    };

    // TODO fix: https://github.com/median-dxz/seerh5-assistant/issues/19
    const [giftingStars, setGiftingStars] = useState(false);
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
        <Paper sx={{ p: 4 }}>
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
