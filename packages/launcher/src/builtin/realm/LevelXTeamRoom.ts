import type { LevelMeta, LevelData as SEALevelData, TaskRunner } from '@/sea-launcher';
import { LevelAction, socket } from '@sea/core';

import type { AnyFunction, ILevelBattle } from '@sea/core';

interface LevelData extends SEALevelData {
    open: boolean;
    dailyMinRound: number;
    dailyRewardReceived: boolean;
    weeklyRewardReceived: boolean;
    weeklyCompletedCount: number;
}

interface LevelOption {
    sweep: boolean;
}

export default (logger: AnyFunction, battle: (name: string) => ILevelBattle) => {
    return class LevelXTeamRoom implements TaskRunner<LevelData> {
        data: LevelData = {
            remainingTimes: 0,
            progress: 0,
            open: false,
            dailyMinRound: 0,
            dailyRewardReceived: false,
            weeklyRewardReceived: false,
            weeklyCompletedCount: 0,
        };

        static readonly meta: LevelMeta = {
            id: 'LevelXTeamRoom',
            name: 'X战队密室',
            maxTimes: 3,
        };

        get meta() {
            return LevelXTeamRoom.meta;
        }

        get name() {
            return LevelXTeamRoom.meta.name;
        }
        logger = logger;

        constructor(public option: LevelOption) {}

        async update() {
            const bits = await socket.bitSet(1000585, 2000036);
            const values = await socket.multiValue(12769, 12774, 20133);
            const pInfos = await socket.playerInfo(1197);

            this.data.dailyRewardReceived = bits[0];
            this.data.weeklyRewardReceived = bits[1];

            this.data.open = Boolean(pInfos[0]);
            this.data.remainingTimes = this.meta.maxTimes - values[0];
            this.data.dailyMinRound = values[1];
            this.data.weeklyCompletedCount = values[2];
        }

        next(): string {
            if (this.data.weeklyRewardReceived) {
                return LevelAction.STOP;
            }

            if (!this.data.weeklyRewardReceived && this.data.weeklyCompletedCount >= 5) {
                return 'award_weekly';
            }

            if (this.data.dailyRewardReceived) {
                return LevelAction.STOP;
            }

            if (!this.data.dailyRewardReceived && this.data.dailyMinRound > 0) {
                return LevelAction.AWARD;
            }

            if (this.data.dailyMinRound === 0 && (this.data.remainingTimes > 0 || this.data.open)) {
                if (this.data.open) {
                    return LevelAction.BATTLE;
                } else {
                    return 'open_level';
                }
            }

            this.logger(`${this.meta.name}: 日任失败`);
            return LevelAction.STOP;
        }

        selectLevelBattle() {
            return battle('LevelXTeamRoom');
        }

        readonly actions: Record<string, () => Promise<void>> = {
            open_level: async () => {
                await socket.sendByQueue(42395, [105, 1, 1, 0]);
            },

            battle: async () => {
                socket.sendByQueue(CommandID.FIGHT_H5_PVE_BOSS, [105, 7, 0]);
            },

            award: async () => {
                await socket.sendByQueue(42395, [105, 2, 0, 0]);
            },

            award_weekly: async () => {
                await socket.sendByQueue(42395, [105, 3, 0, 0]);
            },
        };
    };
};
