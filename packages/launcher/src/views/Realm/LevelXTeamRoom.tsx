import { SEALevelState, Socket } from 'sea-core';

import type { ILevelBattleStrategy, ILevelRunner, SEALevelData, SEALevelInfo } from 'sea-core';

import { SeaModuleLogger } from '@sea-launcher/utils/logger';
import dataProvider from './data';

const customData = dataProvider['LevelXTeamRoom'];

interface LevelData extends SEALevelData {
    open: boolean;
    dailyMinRound: number;
    dailyRewardReceived: boolean;
    weeklyRewardReceived: boolean;
    weeklyCompletedCount: number;
}

export class LevelXTeamRoom implements ILevelRunner<LevelData, SEALevelInfo> {
    data: LevelData = {
        leftTimes: 0,
        state: SEALevelState.STOP,
        success: false,
        open: false,
        dailyMinRound: 0,
        dailyRewardReceived: false,
        weeklyRewardReceived: false,
        weeklyCompletedCount: 0,
    };

    readonly info = {
        name: 'X战队密室',
        maxTimes: 3,
    };

    option = { sweep: false };

    logger = SeaModuleLogger('X战队密室', "info");

    async updater() {
        this.logger(`${this.info.name}: 更新关卡信息...`);
        const bits = await Socket.bitSet(1000585, 2000036);
        const values = await Socket.multiValue(12769, 12774, 20133);
        const pInfos = await Socket.playerInfo(1197);

        this.data.dailyRewardReceived = bits[0];
        this.data.weeklyRewardReceived = bits[1];

        this.data.open = Boolean(pInfos[0]);
        this.data.leftTimes = this.info.maxTimes - values[0];
        this.data.dailyMinRound = values[1];
        this.data.weeklyCompletedCount = values[2];

        if (this.data.state === ('award_error' as SEALevelState)) {
            this.data.success = false;
            return SEALevelState.STOP;
        }

        if (this.data.weeklyRewardReceived) {
            this.logger(`${this.info.name}: 日任完成`);
            this.data.success = true;
            return SEALevelState.STOP;
        }

        if (!this.data.weeklyRewardReceived && this.data.weeklyCompletedCount >= 5) {
            this.logger(`${this.info.name}: 领取每周奖励`);
            return 'award_weekly' as unknown as SEALevelState;
        }

        if (this.data.dailyRewardReceived) {
            this.logger(`${this.info.name}: 日任完成`);
            this.data.success = true;
            return SEALevelState.STOP;
        }

        if (!this.data.dailyRewardReceived && this.data.dailyMinRound > 0) {
            this.logger(`${this.info.name}: 领取每日奖励`);
            return SEALevelState.AWARD;
        }

        if (this.data.dailyMinRound === 0 && (this.data.leftTimes > 0 || this.data.open)) {
            this.logger(`${this.info.name}: 进入战斗`);
            if (this.data.open) {
                return SEALevelState.BATTLE;
            } else {
                return 'open_level' as unknown as SEALevelState;
            }
        }

        this.logger(`${this.info.name}: 日任失败`);
        this.data.success = false;
        return SEALevelState.STOP;
    }

    selectBattle() {
        return {
            pets: customData.cts,
            strategy: customData.strategy,
        } as ILevelBattleStrategy;
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
                this.data.state = 'award_error' as SEALevelState;
            }
        },

        award_weekly: async () => {
            try {
                await Socket.sendByQueue(42395, [105, 3, 0, 0]);
            } catch (error) {
                this.logger(error);
                this.data.state = 'award_error' as SEALevelState;
            }
        },
    };
}