import { LevelAction, socket, type ILevelRunner, type LevelData } from '@sea/core';
import type { LevelMeta, Task, TaskRunner } from '@sea/launcher';
import { SignBase } from './SignBase';

export const vip = () =>
    [
        class VipDailyBox extends SignBase implements TaskRunner {
            static readonly meta: LevelMeta = {
                id: 'VipDailyBox',
                name: '领取vip每日箱子',
                maxTimes: 1,
            };

            get meta(): LevelMeta {
                return VipDailyBox.meta;
            }

            actions: Record<string, (this: ILevelRunner<LevelData>) => Promise<void>> = {
                [LevelAction.AWARD]: async () => {
                    await socket.sendByQueue(CommandID.VIP_BONUS_201409, [1]);
                },
            };

            async update(): Promise<void> {
                const times = (await socket.multiValue(11516))[0];
                this.data.remainingTimes = Number(!times);
            }
        },
        class VipWeeklyBox extends SignBase implements TaskRunner {
            static readonly meta: LevelMeta = {
                id: 'VipWeeklyBox',
                name: '领取vip每周箱子',
                maxTimes: 1,
            };

            get meta(): LevelMeta {
                return VipWeeklyBox.meta;
            }

            actions: Record<string, (this: ILevelRunner<LevelData>) => Promise<void>> = {
                [LevelAction.AWARD]: async () => {
                    await socket.sendByQueue(CommandID.VIP_BONUS_201409, [2]);
                },
            };

            async update(): Promise<void> {
                const times = (await socket.multiValue(20021))[0];
                this.data.remainingTimes = Number(!times);
            }
        },
        class VipMonthlyBox extends SignBase implements TaskRunner {
            static readonly meta: LevelMeta = {
                id: 'VipMonthlyBox',
                name: '领取vip每月箱子',
                maxTimes: 1,
            };
            get meta(): LevelMeta {
                return VipMonthlyBox.meta;
            }

            actions: Record<string, (this: ILevelRunner<LevelData>) => Promise<void>> = {
                [LevelAction.AWARD]: async () => {
                    await socket.sendByQueue(CommandID.VIP_BONUS_201409, [3]);
                },
            };

            async update(): Promise<void> {
                const times = (await socket.multiValue(30005))[0];
                this.data.remainingTimes = Number(!times);
            }
        },
    ] satisfies Task[];
