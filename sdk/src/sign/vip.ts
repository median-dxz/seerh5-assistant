import { Socket } from 'sea-core/engine';

interface Config {
    exchangeId: number;
}

const EXCHANGE_LIST = {
    vip点数: {
        特性重组剂: 1,
        体力上限药: 3,
        上等体力药剂: 4,
    },
};

class Vip implements SEAMod.ISignMod<Config> {
    declare logger: typeof console.log;

    meta: SEAMod.MetaData = {
        id: 'Vip',
        scope: 'median',
        type: 'sign',
        description: 'vip签到',
    };

    defaultConfig: Config = { exchangeId: EXCHANGE_LIST.vip点数.体力上限药 };
    config: Config;

    export: Record<string, SEAMod.SignModExport> = {
        领取vip每日箱子: {
            check: async () => {
                const times = (await Socket.multiValue(11516))[0];
                return Number(!times);
            },
            run: () => Socket.sendByQueue(CommandID.VIP_BONUS_201409, [1]),
        },

        领取vip每周箱子: {
            check: async () => {
                const times = (await Socket.multiValue(20021))[0];
                return Number(!times);
            },
            run: () => Socket.sendByQueue(CommandID.VIP_BONUS_201409, [2]),
        },

        领取vip每月箱子: {
            check: async () => {
                const times = (await Socket.multiValue(30005))[0];
                return Number(!times);
            },
            run: () => Socket.sendByQueue(CommandID.VIP_BONUS_201409, [3]),
        },

        领取vip点数: {
            check: async () => {
                const times = (await Socket.multiValue(14204))[0];
                if (MainManager.actorInfo.vipScore >= MainManager.actorInfo.vipScoreMax) {
                    return 0;
                } else {
                    return Number(!times);
                }
            },
            run: () =>
                Socket.sendByQueue(CommandID.SEER_VIP_DAILY_REWARD).then(() =>
                    Socket.sendByQueue(CommandID.SEER_VIP_DAILY_CHECK, [1])
                ),
        },

        兑换vip道具: {
            check: async () => {
                const score = MainManager.actorInfo.vipScore;
                return Number(score >= 20);
            },
            run: () =>
                Socket.sendByQueue(CommandID.VIP_SCORE_EXCHANGE, [this.config.exchangeId]).then(() =>
                    EventManager.dispatchEventWith('vipRewardBuyOrGetItem')
                ),
        },
    };
}

export default Vip;
