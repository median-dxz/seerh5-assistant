import { Socket } from 'sa-core/engine';

const MULTI_QUERY = {
    刻印抽奖次数: 16577,

    登录时长: 12462,
    已许愿次数: 12231,
    许愿签到天数: 20235,
    许愿签到: 201345,
} as const;

class Daily implements SAMod.ISignMod<null> {
    declare logger: typeof console.log;

    meta: SAMod.MetaData = {
        id: 'daily',
        author: 'median',
        type: 'sign',
        description: '日常签到',
    };

    export: Record<string, SAMod.SignModExport> = {
        刻印抽奖: {
            check: async () => {
                const times = (await Socket.multiValue(MULTI_QUERY.刻印抽奖次数))[0];
                return Number(!times);
            },
            run: () => Socket.sendByQueue(46301, [1, 0]),
        },
        许愿: {
            check: async () => {
                let times = (await Socket.multiValue(MULTI_QUERY.登录时长))[0];
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

                可许愿次数 -= (await Socket.multiValue(MULTI_QUERY.已许愿次数))[0];
                return 可许愿次数;
            },
            run: () => Socket.sendByQueue(45801, [2, 1]),
        },
        许愿签到: {
            check: async () => {
                const times = (await Socket.multiValue(MULTI_QUERY.许愿签到))[0];
                return Number(!times);
            },
            run: async () => {
                const day = (await Socket.multiValue(MULTI_QUERY.许愿签到天数))[0];
                Socket.sendByQueue(45801, [day, 1]);
            },
        },
    };
}

export default Daily;
