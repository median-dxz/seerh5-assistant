import { Socket } from 'sea-core/engine';

const vip = (exchangeId: number) =>
    [
        {
            name: '领取vip每日箱子',
            check: async () => {
                const times = (await Socket.multiValue(11516))[0];
                return Number(!times);
            },
            run: async () => {
                Socket.sendByQueue(CommandID.VIP_BONUS_201409, [1]);
            },
        },

        {
            name: '领取vip每周箱子',
            check: async () => {
                const times = (await Socket.multiValue(20021))[0];
                return Number(!times);
            },
            run: async () => {
                Socket.sendByQueue(CommandID.VIP_BONUS_201409, [2]);
            },
        },

        {
            name: '领取vip每月箱子',
            check: async () => {
                const times = (await Socket.multiValue(30005))[0];
                return Number(!times);
            },
            run: async () => {
                Socket.sendByQueue(CommandID.VIP_BONUS_201409, [3]);
            },
        },

        {
            name: '领取vip点数',
            check: async () => {
                const times = (await Socket.multiValue(14204))[0];
                if (MainManager.actorInfo.vipScore >= MainManager.actorInfo.vipScoreMax) {
                    return 0;
                } else {
                    return Number(!times);
                }
            },
            run: async () => {
                Socket.sendByQueue(CommandID.SEER_VIP_DAILY_REWARD).then(() =>
                    Socket.sendByQueue(CommandID.SEER_VIP_DAILY_CHECK, [1])
                );
            },
        },
        {
            name: '兑换vip道具',
            check: async () => {
                const score = MainManager.actorInfo.vipScore;
                return Number(score >= 20);
            },
            run: async () => {
                Socket.sendByQueue(CommandID.VIP_SCORE_EXCHANGE, [exchangeId]).then(() =>
                    EventManager.dispatchEventWith('vipRewardBuyOrGetItem')
                );
            },
        },
    ] satisfies SEAL.Sign[];
