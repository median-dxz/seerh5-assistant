import type { AnyFunction, LevelBattle } from '@sea/core';
import type { LevelData } from '@sea/mod-type';

import { LevelAction, socket } from '@sea/core';
import { task } from '@sea/mod-type';

export interface Data extends LevelData {
    open: boolean;
    dailyMinRound: number;
    dailyRewardReceived: boolean;
    weeklyRewardReceived: boolean;
    weeklyCompletedCount: number;
}

export default (logger: AnyFunction, battle: (name: string) => LevelBattle) =>
    task({
        metadata: {
            id: 'LevelXTeamRoom',
            name: 'X战队密室',
            maxTimes: 3
        },
        runner: (meta) => ({
            logger,
            data: {
                remainingTimes: 0,
                progress: 0,
                open: false,
                dailyMinRound: 0,
                dailyRewardReceived: false,
                weeklyRewardReceived: false,
                weeklyCompletedCount: 0
            } as Data,
            next() {
                if (this.data.weeklyRewardReceived) {
                    return LevelAction.STOP;
                } else if (this.data.weeklyCompletedCount >= 5) {
                    return 'award_weekly';
                }

                if (this.data.dailyRewardReceived) {
                    return LevelAction.STOP;
                } else if (this.data.dailyMinRound > 0) {
                    return LevelAction.AWARD;
                }

                if (this.data.dailyMinRound === 0 && (this.data.remainingTimes > 0 || this.data.open)) {
                    if (this.data.open) {
                        return LevelAction.BATTLE;
                    } else {
                        return 'open_level';
                    }
                }

                this.logger(`${meta.name}: 日任失败`);
                return LevelAction.STOP;
            },
            async update() {
                const bits = await socket.bitSet(1000585, 2000036);
                const values = await socket.multiValue(12769, 12774, 20133);
                const pInfos = await socket.playerInfo(1197);

                this.data.dailyRewardReceived = bits[0];
                this.data.weeklyRewardReceived = bits[1];

                this.data.open = Boolean(pInfos[0]);
                this.data.remainingTimes = meta.maxTimes - values[0];
                this.data.dailyMinRound = values[1];
                this.data.weeklyCompletedCount = values[2];
            },
            selectLevelBattle() {
                return battle('LevelXTeamRoom');
            },
            actions: {
                open_level: async () => {
                    await socket.sendByQueue(42395, [105, 1, 1, 0]);
                },
                battle: async () => {
                    await socket.sendByQueue(CommandID.FIGHT_H5_PVE_BOSS, [105, 7, 0]);
                },
                award: async () => {
                    await socket.sendByQueue(42395, [105, 2, 0, 0]);
                },
                award_weekly: async () => {
                    await socket.sendByQueue(42395, [105, 3, 0, 0]);
                }
            }
        })
    });
