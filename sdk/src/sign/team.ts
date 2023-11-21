import { Socket } from 'sea-core/engine';
import type { SEAMod } from '../../lib/mod';

interface Config {
    exchangeId: number;
}

const MULTI_QUERY = {
    资源生产次数: 12470,
    道具兑换次数: 12471,
} as const;

const EXCHANGE_LIST = {
    战队道具: {
        不灭能量珠: 10,
        愤怒珠子: 9,
        战队加成遗忘药: 8,
        特防珠: 6,
        防御珠: 5,
        特攻珠: 4,
        攻击珠: 3,
    },
};

class Team implements SEAMod.ISignMod<Config> {
    declare logger: typeof console.log;

    meta: SEAMod.MetaData = {
        id: 'Team',
        scope: 'median',
        type: 'sign',
        description: '战队签到',
    };

    defaultConfig: Config = { exchangeId: EXCHANGE_LIST.战队道具.不灭能量珠 };
    config: Config;

    export: Record<string, SEAMod.SignModExport<typeof this>> = {
        生产资源: {
            check: async () => {
                if (MainManager.actorInfo.teamInfo && MainManager.actorInfo.teamInfo.id > 0) {
                    const times = (await Socket.multiValue(MULTI_QUERY.资源生产次数))[0];
                    return 5 - times;
                }
                return 0;
            },
            // RES_PRODUCT_BUY
            run: () => Socket.sendByQueue(CommandID.RES_PRODUCTORBUY, [2, 0]),
        },
        兑换道具: {
            check: async () => {
                if (MainManager.actorInfo.teamInfo && MainManager.actorInfo.teamInfo.id > 0) {
                    const times = (await Socket.multiValue(MULTI_QUERY.道具兑换次数))[0];
                    const open = await Socket.sendByQueue(CommandID.GET_TEAM_DEVICE_STATUS, [1, 2]).then((buf) => {
                        const bytes = new DataView(buf);
                        return Boolean(bytes.getUint32(4));
                    });
                    return open ? 3 - times : 0;
                }
                return 0;
            },
            run: async () => {
                Socket.sendByQueue(CommandID.NEW_TEAM_EXCHANGE_ITEMS, [1, this.config.exchangeId]);
            },
        },
    };
}

export default Team;
