import { socket } from '@sea/core';

export const vip = (exchangeId: number) =>
    [
        {
            name: '领取vip每日箱子',
            check: async () => {
                const times = (await socket.multiValue(11516))[0];
                return Number(!times);
            },
            run: async () => {
                socket.sendByQueue(CommandID.VIP_BONUS_201409, [1]);
            },
        },

        {
            name: '领取vip每周箱子',
            check: async () => {
                const times = (await socket.multiValue(20021))[0];
                return Number(!times);
            },
            run: async () => {
                socket.sendByQueue(CommandID.VIP_BONUS_201409, [2]);
            },
        },

        {
            name: '领取vip每月箱子',
            check: async () => {
                const times = (await socket.multiValue(30005))[0];
                return Number(!times);
            },
            run: async () => {
                socket.sendByQueue(CommandID.VIP_BONUS_201409, [3]);
            },
        },
    ] satisfies SEAL.Sign[];
