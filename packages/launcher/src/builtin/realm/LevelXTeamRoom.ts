import { LevelAction, Socket } from 'sea-core';

import type { AnyFunction, ILevelBattle, ILevelRunner, LevelData as SEALevelData } from 'sea-core';

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
    return class LevelXTeamRoom implements ILevelRunner<LevelData> {
        data: LevelData = {
            leftTimes: 0,
            state: LevelAction.STOP,
            success: false,
            open: false,
            dailyMinRound: 0,
            dailyRewardReceived: false,
            weeklyRewardReceived: false,
            weeklyCompletedCount: 0,
        };

        static readonly meta: SEAL.LevelMeta = {
            id: 'LevelXTeamRoom',
            name: 'X战队密室',
            maxTimes: 3,
        };

        get meta() {
            return LevelXTeamRoom.meta;
        }

        logger = logger;

        constructor(public option: LevelOption) {}

        async updater() {
            this.logger(`${this.meta.name}: 更新关卡信息...`);
            const bits = await Socket.bitSet(1000585, 2000036);
            const values = await Socket.multiValue(12769, 12774, 20133);
            const pInfos = await Socket.playerInfo(1197);

            this.data.dailyRewardReceived = bits[0];
            this.data.weeklyRewardReceived = bits[1];

            this.data.open = Boolean(pInfos[0]);
            this.data.leftTimes = this.meta.maxTimes - values[0];
            this.data.dailyMinRound = values[1];
            this.data.weeklyCompletedCount = values[2];

            if (this.data.state === 'award_error') {
                this.data.success = false;
                return LevelAction.STOP;
            }

            if (this.data.weeklyRewardReceived) {
                this.logger(`${this.meta.name}: 日任完成`);
                this.data.success = true;
                return LevelAction.STOP;
            }

            if (!this.data.weeklyRewardReceived && this.data.weeklyCompletedCount >= 5) {
                this.logger(`${this.meta.name}: 领取每周奖励`);
                return 'award_weekly';
            }

            if (this.data.dailyRewardReceived) {
                this.logger(`${this.meta.name}: 日任完成`);
                this.data.success = true;
                return LevelAction.STOP;
            }

            if (!this.data.dailyRewardReceived && this.data.dailyMinRound > 0) {
                this.logger(`${this.meta.name}: 领取每日奖励`);
                return LevelAction.AWARD;
            }

            if (this.data.dailyMinRound === 0 && (this.data.leftTimes > 0 || this.data.open)) {
                this.logger(`${this.meta.name}: 进入战斗`);
                if (this.data.open) {
                    return LevelAction.BATTLE;
                } else {
                    return 'open_level';
                }
            }

            this.logger(`${this.meta.name}: 日任失败`);
            this.data.success = false;
            return LevelAction.STOP;
        }

        selectBattle() {
            return battle('LevelXTeamRoom');
        }

        readonly actions: Record<string, () => Promise<void>> = {
            open_level: async () => {
                await Socket.sendByQueue(42395, [105, 1, 1, 0]);
            },

            battle: async () => {
                Socket.sendByQueue(CommandID.FIGHT_H5_PVE_BOSS, [105, 7, 0]);
            },

            award: async () => {
                try {
                    await Socket.sendByQueue(42395, [105, 2, 0, 0]);
                } catch (error) {
                    this.logger(error);
                    this.data.state = 'award_error';
                }
            },

            award_weekly: async () => {
                try {
                    await Socket.sendByQueue(42395, [105, 3, 0, 0]);
                } catch (error) {
                    this.logger(error);
                    this.data.state = 'award_error';
                }
            },
        };
    };
};
