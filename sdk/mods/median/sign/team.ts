import { LevelAction, socket, type AnyFunction } from '@sea/core';
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

export const teamSign = (logger: AnyFunction) => [
    task({
        metadata: {
            id: 'ProductResource',
            name: '生产资源'
        },
        runner: () => ({
            ...signBase,
            logger,
            data: { ...data, maxTimes: 5 },
            async update() {
                if (MainManager.actorInfo.teamInfo && MainManager.actorInfo.teamInfo.id > 0) {
                    const times = (await socket.multiValue(MULTI_QUERY.资源生产次数))[0];
                    this.data.remainingTimes = this.data.maxTimes - times;
                } else {
                    this.data.remainingTimes = this.data.maxTimes = 0;
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
        metadata: {
            id: 'ExchangeItem',
            name: '兑换道具'
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
        runner: (options) => ({
            ...signBase,
            logger,
            data: { ...data, maxTimes: 3 },
            async update() {
                if (MainManager.actorInfo.teamInfo && MainManager.actorInfo.teamInfo.id > 0) {
                    const times = (await socket.multiValue(MULTI_QUERY.道具兑换次数))[0];
                    const open = await socket.sendByQueue(CommandID.GET_TEAM_DEVICE_STATUS, [1, 2]).then((buf) => {
                        const bytes = new DataView(buf as ArrayBuffer);
                        return Boolean(bytes.getUint32(4));
                    });
                    this.data.remainingTimes = open ? this.data.maxTimes - times : 0;
                } else {
                    this.data.remainingTimes = this.data.maxTimes = 0;
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
