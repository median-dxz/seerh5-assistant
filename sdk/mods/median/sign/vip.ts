import { LevelAction, socket } from '@sea/core';
import { task } from '@sea/mod-type';
import { data, signBase } from './SignBase';

export const vip = [
    task({
        metadata: {
            id: 'VipDailyBox',
            name: '领取vip每日箱子',
            maxTimes: 1
        },
        runner: () => ({
            ...signBase,
            data: { ...data },
            async update() {
                const times = (await socket.multiValue(11516))[0];
                this.data.remainingTimes = Number(!times);
            },
            actions: {
                [LevelAction.AWARD]: async () => {
                    await socket.sendByQueue(CommandID.VIP_BONUS_201409, [1]);
                }
            }
        })
    }),

    task({
        metadata: {
            id: 'VipWeeklyBox',
            name: '领取vip每周箱子',
            maxTimes: 1
        },
        runner: () => ({
            ...signBase,
            data: { ...data },
            async update() {
                const times = (await socket.multiValue(20021))[0];
                this.data.remainingTimes = Number(!times);
            },
            actions: {
                [LevelAction.AWARD]: async () => {
                    await socket.sendByQueue(CommandID.VIP_BONUS_201409, [2]);
                }
            }
        })
    }),

    task({
        metadata: {
            id: 'VipMonthlyBox',
            name: '领取vip每月箱子',
            maxTimes: 1
        },
        runner: () => ({
            ...signBase,
            data: { ...data },
            async update() {
                const times = (await socket.multiValue(30005))[0];
                this.data.remainingTimes = Number(!times);
            },
            actions: {
                [LevelAction.AWARD]: async () => {
                    await socket.sendByQueue(CommandID.VIP_BONUS_201409, [3]);
                }
            }
        })
    })
];
