import type { ILevelRunner, LevelData } from '@sea/core';
import { LevelAction, socket } from '@sea/core';
import type { LevelMeta, Task, TaskRunner } from '@sea/launcher';
import { SignBase } from './SignBase';

const MULTI_QUERY = {
    刻印抽奖次数: 16577,
    登录时长: 12462,
    已许愿次数: 12231,
    许愿签到天数: 20235,
    许愿签到: 201345,
} as const;

export const daily: Task[] = [
    class MarkDraw extends SignBase implements TaskRunner {
        static readonly meta: LevelMeta = {
            maxTimes: 1,
            id: 'MarkDraw',
            name: '刻印抽奖',
        };

        get meta(): LevelMeta {
            return MarkDraw.meta;
        }

        actions: Record<string, (this: ILevelRunner<LevelData>) => Promise<void>> = {
            [LevelAction.AWARD]: async () => {
                socket.sendByQueue(46301, [1, 0]);
            },
        };

        async update(): Promise<void> {
            this.data.remainingTimes = this.meta.maxTimes - (await socket.multiValue(MULTI_QUERY.刻印抽奖次数))[0];
        }
    },
    class WishBottle extends SignBase implements TaskRunner {
        static readonly meta: LevelMeta = {
            id: 'WishBottle',
            maxTimes: 10,
            name: '许愿',
        };

        maxTimes = 10;

        get meta(): LevelMeta {
            return { ...WishBottle.meta, maxTimes: this.maxTimes };
        }

        actions: Record<string, (this: ILevelRunner<LevelData>) => Promise<void>> = {
            [LevelAction.AWARD]: async () => {
                await socket.sendByQueue(45801, [2, 1]);
            },
        };

        async update(): Promise<void> {
            let times = (await socket.multiValue(MULTI_QUERY.登录时长))[0];
            times =
                times +
                Math.floor(SystemTimerManager.sysBJDate.getTime() / 1e3) -
                MainManager.actorInfo.logintimeThisTime;
            times = Math.floor(times / 60);

            let 可许愿次数 = 0;
            const timesMap = new Map([
                [120, 10],
                [90, 7],
                [60, 5],
                [30, 3],
                [15, 2],
                [5, 1],
                [0, 0],
            ]);

            for (const [time, count] of timesMap) {
                if (times >= time) {
                    可许愿次数 = count;
                    break;
                }
            }

            this.maxTimes = 可许愿次数;
            this.data.remainingTimes = 可许愿次数 - (await socket.multiValue(MULTI_QUERY.已许愿次数))[0];
        }
    },
    class WishSign extends SignBase implements TaskRunner {
        static readonly meta: LevelMeta = {
            id: 'WishSign',
            maxTimes: 1,
            name: '许愿签到',
        };

        get meta(): LevelMeta {
            return WishSign.meta;
        }

        data: LevelData = {
            progress: 0,
            remainingTimes: 0,
        };

        actions: Record<string, (this: ILevelRunner<LevelData>) => Promise<void>> = {
            [LevelAction.AWARD]: async () => {
                const day = (await socket.multiValue(MULTI_QUERY.许愿签到天数))[0];
                socket.sendByQueue(45801, [1, day + 1]);
            },
        };

        async update(): Promise<void> {
            this.data.remainingTimes = this.meta.maxTimes - (await socket.multiValue(MULTI_QUERY.许愿签到))[0];
        }
    },
];
