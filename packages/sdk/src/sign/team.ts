import { Socket } from 'sa-core/engine';

interface Config {
    exchangeId: number;
}

const MULTI_QUERY = {
    资源生产次数: 12470,
} as const;

const EXCHANGE_LIST = {
    战队道具: {
        不灭能量珠: 10,
    },
};

class Team implements SAMod.ISignMod<Config> {
    declare logger: typeof console.log;

    meta: SAMod.MetaData = {
        id: 'Team',
        author: 'median',
        type: 'sign',
        description: '战队签到',
    };

    defaultConfig: Config = { exchangeId: EXCHANGE_LIST.战队道具.不灭能量珠 };
    config: Config;

    export: Record<string, SAMod.SignModExport<typeof this>> = {
        生产资源: {
            check: async () => {
                const times = (await Socket.multiValue(MULTI_QUERY.资源生产次数))[0];
                return Math.max(0, 5 - times);
            },
            // RES_PRODUCT_BUY
            run: () => Socket.sendByQueue(CommandID.RES_PRODUCTORBUY, [2, 0]),
        },
        兑换道具: {
            check: async () => {
                const times = (await Socket.multiValue(12471))[0];
                return Math.max(0, 3 - times);
            },
            // 有问题, 要先打开战队面板?
            run: () => Socket.sendByQueue(2940, [1, this.config.exchangeId]),
        },
    };
}

export default Team;
