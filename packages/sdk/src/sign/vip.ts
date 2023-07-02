import { Socket } from 'sa-core/engine';

interface Config {
    exchangeId: number;
}

const EXCHANGE_LIST = {
    vip点数: {
        特性重组剂: 1,
        体力上限药: 2,
    },
};

class Vip implements SAMod.ISignMod<Config> {
    declare logger: typeof console.log;

    meta: SAMod.MetaData = {
        id: 'Vip',
        scope: 'median',
        type: 'sign',
        description: 'vip签到',
    };

    defaultConfig: Config = { exchangeId: EXCHANGE_LIST.vip点数.体力上限药 };
    config: Config;

    export: Record<string, SAMod.SignModExport> = {
        领取vip箱子: {
            check: async () => {
                const times = (await Socket.multiValue(14204))[0];
                return Number(!times);
            },
            run: () => Socket.sendByQueue(CommandID.SEER_VIP_DAILY_REWARD),
        },

        领取vip点数: {
            check: async () => {
                const times = (await Socket.multiValue(11516))[0];
                return Number(!times);
            },
            run: () => Socket.sendByQueue(CommandID.VIP_BONUS_201409, [1]),
        },

        兑换vip道具: {
            check: async () => {
                const score = MainManager.actorInfo.vipScore;
                return Number(score >= 20);
            },
            run: () =>
                Socket.sendByQueue(CommandID.VIP_SCORE_EXCHANGE, [this.config.exchangeId]).then(() => {
                    EventManager.dispatchEventWith('vipRewardBuyOrGetItem');
                }),
        },
    };
}

export default Vip;
