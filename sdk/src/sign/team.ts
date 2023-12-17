import { Socket } from 'sea-core';

const MULTI_QUERY = {
    资源生产次数: 12470,
    道具兑换次数: 12471,
} as const;

declare class MainManager {
    static actorInfo: {
        teamInfo?: {
            id: number;
        };
    };
}

export const teamSign = (exchangeId: number) =>
    [
        {
            name: '生产资源',
            check: async () => {
                if (MainManager.actorInfo.teamInfo && MainManager.actorInfo.teamInfo.id > 0) {
                    const times = (await Socket.multiValue(MULTI_QUERY.资源生产次数))[0];
                    return 5 - times;
                }
                return 0;
            },
            // RES_PRODUCT_BUY
            run: async () => {
                Socket.sendByQueue(CommandID.RES_PRODUCTORBUY, [2, 0]);
            },
        },
        {
            name: '兑换道具',
            check: async () => {
                if (MainManager.actorInfo.teamInfo && MainManager.actorInfo.teamInfo.id > 0) {
                    const times = (await Socket.multiValue(MULTI_QUERY.道具兑换次数))[0];
                    const open = await Socket.sendByQueue(CommandID.GET_TEAM_DEVICE_STATUS, [1, 2]).then((buf) => {
                        const bytes = new DataView(buf as ArrayBuffer);
                        return Boolean(bytes.getUint32(4));
                    });
                    return open ? 3 - times : 0;
                }
                return 0;
            },
            run: async () => {
                Socket.sendByQueue(CommandID.NEW_TEAM_EXCHANGE_ITEMS, [1, exchangeId]);
            },
        },
    ] satisfies SEAL.Sign[];
