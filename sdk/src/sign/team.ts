import { LevelAction, socket, type ILevelRunner, type LevelData } from '@sea/core';
import type { LevelMeta, Task, TaskRunner } from '@sea/launcher';
import { SignBase } from './SignBase';

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
        class ProductResource extends SignBase implements TaskRunner {
            static readonly meta: LevelMeta = {
                id: 'ProductResource',
                name: '生产资源',
                maxTimes: 5,
            };

            get meta(): LevelMeta {
                return ProductResource.meta;
            }

            actions: Record<string, (this: ILevelRunner<LevelData>) => Promise<void>> = {
                [LevelAction.AWARD]: async () => {
                    if (MainManager.actorInfo.teamInfo && MainManager.actorInfo.teamInfo.id > 0) {
                        const times = (await socket.multiValue(MULTI_QUERY.资源生产次数))[0];
                        this.data.remainingTimes = 5 - times;
                    }
                    this.data.remainingTimes = 0;
                },
            };

            async update(): Promise<void> {
                await socket.sendByQueue(CommandID.RES_PRODUCTORBUY, [2, 0]);
            }
        },
        class ExchangeItem extends SignBase implements TaskRunner {
            static readonly meta: LevelMeta = {
                id: 'ExchangeItem',
                name: '兑换道具',
                maxTimes: 3,
            };

            get meta(): LevelMeta {
                return ExchangeItem.meta;
            }

            actions: Record<string, (this: ILevelRunner<LevelData>) => Promise<void>> = {
                [LevelAction.AWARD]: async () => {
                    await socket.sendByQueue(CommandID.NEW_TEAM_EXCHANGE_ITEMS, [1, exchangeId]);
                },
            };

            async update(): Promise<void> {
                if (MainManager.actorInfo.teamInfo && MainManager.actorInfo.teamInfo.id > 0) {
                    const times = (await socket.multiValue(MULTI_QUERY.道具兑换次数))[0];
                    const open = await socket.sendByQueue(CommandID.GET_TEAM_DEVICE_STATUS, [1, 2]).then((buf) => {
                        const bytes = new DataView(buf as ArrayBuffer);
                        return Boolean(bytes.getUint32(4));
                    });
                    this.data.remainingTimes = open ? 3 - times : 0;
                }
                this.data.remainingTimes = 0;
            }
        },
    ] satisfies Task[];
