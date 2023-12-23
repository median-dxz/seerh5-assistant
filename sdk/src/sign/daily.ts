import { socket } from '@sea/core';

const MULTI_QUERY = {
    刻印抽奖次数: 16577,
    登录时长: 12462,
    已许愿次数: 12231,
    许愿签到天数: 20235,
    许愿签到: 201345,
} as const;

export const daily: SEAL.Sign[] = [
    {
        name: '刻印抽奖',
        async check() {
            const times = (await socket.multiValue(MULTI_QUERY.刻印抽奖次数))[0];
            return Number(!times);
        },
        run: async () => {
            socket.sendByQueue(46301, [1, 0]);
        },
    },
    {
        name: '许愿',
        async check() {
            let times = (await socket.multiValue(MULTI_QUERY.登录时长))[0];
            times =
                times +
                Math.floor(SystemTimerManager.sysBJDate.getTime() / 1e3) -
                MainManager.actorInfo.logintimeThisTime;
            times = Math.floor(times / 60);

            let 可许愿次数 = 0;
            switch (true) {
                case times >= 120:
                    可许愿次数 = 10;
                    break;
                case times >= 90:
                    可许愿次数 = 7;
                    break;
                case times >= 60:
                    可许愿次数 = 5;
                    break;
                case times >= 30:
                    可许愿次数 = 3;
                    break;
                case times >= 15:
                    可许愿次数 = 2;
                    break;
                case times >= 5:
                    可许愿次数 = 1;
                    break;
                default:
                    可许愿次数 = 0;
            }

            可许愿次数 -= (await socket.multiValue(MULTI_QUERY.已许愿次数))[0];
            return 可许愿次数;
        },
        run: async () => {
            await socket.sendByQueue(45801, [2, 1]);
        },
    },
    {
        name: '许愿签到',
        async check() {
            const times = (await socket.multiValue(MULTI_QUERY.许愿签到))[0];
            return Number(!times);
        },
        async run() {
            const day = (await socket.multiValue(MULTI_QUERY.许愿签到天数))[0];
            socket.sendByQueue(45801, [1, day + 1]);
        },
    },
];
