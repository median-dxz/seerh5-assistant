import { LevelAction, socket } from '@sea/core';
import { task } from '@sea/mod-type';
import { data, signBase } from './SignBase';

const MULTI_QUERY = {
    资源生产次数: 12470,
    道具兑换次数: 12471
} as const;

declare class MainManager {
    static actorInfo: {
        teamInfo?: {
            id: number;
        };
    };
}

const EXCHANGE_LIST = {
    不灭能量珠: '10',
    愤怒珠子: '9',
    战队加成遗忘药: '8',
    特防珠: '6',
    防御珠: '5',
    特攻珠: '4',
    攻击珠: '3'
};

export const teamSign = [
    task({
        meta: {
            id: 'ProductResource',
            name: '生产资源',
            maxTimes: 5
        },
        runner: (meta) => ({
            ...signBase,
            data: { ...data },
            async update() {
                if (MainManager.actorInfo.teamInfo && MainManager.actorInfo.teamInfo.id > 0) {
                    const times = (await socket.multiValue(MULTI_QUERY.资源生产次数))[0];
                    this.data.remainingTimes = meta.maxTimes - times;
                } else {
                    this.data.remainingTimes = meta.maxTimes = 0;
                }
            },
            actions: {
                [LevelAction.AWARD]: async () => {
                    await socket.sendByQueue(CommandID.RES_PRODUCTORBUY, [2, 0]);
                }
            }
        })
    }),

    task({
        meta: {
            id: 'ExchangeItem',
            name: '兑换道具',
            maxTimes: 3
        },
        configSchema: {
            exchangeId: {
                name: '战队兑换',
                type: 'select',
                description: '在战队商店中兑换的物品',
                default: '10',
                list: EXCHANGE_LIST
            }
        },
        runner: (meta, options) => ({
            ...signBase,
            data: { ...data },
            async update() {
                if (MainManager.actorInfo.teamInfo && MainManager.actorInfo.teamInfo.id > 0) {
                    const times = (await socket.multiValue(MULTI_QUERY.道具兑换次数))[0];
                    const open = await socket.sendByQueue(CommandID.GET_TEAM_DEVICE_STATUS, [1, 2]).then((buf) => {
                        const bytes = new DataView(buf as ArrayBuffer);
                        return Boolean(bytes.getUint32(4));
                    });
                    this.data.remainingTimes = open ? 3 - times : 0;
                } else {
                    this.data.remainingTimes = meta.maxTimes = 0;
                }
            },
            actions: {
                [LevelAction.AWARD]: async () => {
                    await socket.sendByQueue(CommandID.NEW_TEAM_EXCHANGE_ITEMS, [1, Number(options.exchangeId)]);
                }
            }
        })
    })
];
