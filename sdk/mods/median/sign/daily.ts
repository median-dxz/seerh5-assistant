import { LevelAction, socket, type AnyFunction } from '@sea/core';
import { task } from '@sea/mod-type';
import { data, signBase } from './SignBase';

const MULTI_QUERY = {
    刻印抽奖次数: 16577,
    登录时长: 12462,
    已许愿次数: 12231,
    许愿签到天数: 20235,
    许愿签到: 201345
} as const;

export const daily = (logger: AnyFunction) => [
    task({
        metadata: { id: 'MarkDraw', name: '刻印抽奖' },
        runner() {
            return {
                ...signBase,
                logger,
                data: { ...data, maxTimes: 1 },
                async update() {
                    this.data.remainingTimes =
                        this.data.maxTimes - (await socket.multiValue(MULTI_QUERY.刻印抽奖次数))[0];
                },
                actions: {
                    [LevelAction.AWARD]: async () => {
                        await socket.sendByQueue(46301, [1, 0]);
                    }
                }
            };
        }
    }),
    task({
        metadata: { id: 'WishBottle', name: '许愿' },
        runner() {
            return {
                ...signBase,
                logger,
                data: { ...data, maxTimes: 10 },
                async update() {
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
                        [0, 0]
                    ]);

                    for (const [time, count] of timesMap) {
                        if (times >= time) {
                            可许愿次数 = count;
                            break;
                        }
                    }

                    this.data.maxTimes = 可许愿次数;
                    this.data.remainingTimes = 可许愿次数 - (await socket.multiValue(MULTI_QUERY.已许愿次数))[0];
                },
                actions: {
                    [LevelAction.AWARD]: async () => {
                        await socket.sendByQueue(45801, [2, 1]);
                    }
                }
            };
        }
    }),
    task({
        metadata: { id: 'WishSign', name: '许愿签到' },
        runner() {
            return {
                ...signBase,
                logger,
                data: { ...data, maxTimes: 1 },
                async update() {
                    this.data.remainingTimes = this.data.maxTimes - (await socket.multiValue(MULTI_QUERY.许愿签到))[0];
                },
                actions: {
                    [LevelAction.AWARD]: async () => {
                        const day = (await socket.multiValue(MULTI_QUERY.许愿签到天数))[0];
                        await socket.sendByQueue(45801, [1, day + 1]);
                    }
                }
            };
        }
    })
];
