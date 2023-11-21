import { LevelState, Socket } from 'sea-core';

import type { ILevelBattleStrategy, ILevelRunner, LevelData as SEALevelData, LevelInfo as SEALevelInfo } from 'sea-core';

import { SEAModuleLogger } from '@sea-launcher/utils/logger';
import dataProvider from './data';

const customData = dataProvider['LevelElfKingsTrial'];

export const ElfKingsId = {
    光王斯嘉丽: 2,
    水王沧岚: 8,
    自然王莫妮卡: 17,
    龙妈乔特鲁德: 6,
    草王茉蕊儿: 15,
    海瑟薇: 12,
    邪灵王摩哥斯: 14,
    格劳瑞: 9,
    战王: 13,
    秘王: 7,
} as const;

interface LevelData extends SEALevelData {
    stimulation: boolean;
    unlockHard: boolean;
    canReceiveReward: boolean;
    weeklyChallengeCount: number;
}

interface LevelOption {
    stimulation: boolean;
    sweep: boolean;
    elfId: (typeof ElfKingsId)[keyof typeof ElfKingsId];
}

export class LevelElfKingsTrial implements ILevelRunner<LevelData, SEALevelInfo> {
    data: LevelData = {
        leftTimes: 0,
        state: LevelState.STOP,
        success: false,
        stimulation: false,
        unlockHard: false,
        canReceiveReward: false,
        weeklyChallengeCount: 0,
    };

    readonly info = {
        name: '精灵王的试炼',
        maxTimes: 6,
    };

    option: LevelOption;

    logger = SEAModuleLogger('精灵王的试炼', 'info');

    constructor(option: LevelOption) {
        this.option = option;
    }

    async updater() {
        const bits = (await Socket.bitSet(8832, 2000037)).map(Boolean);
        const values = await Socket.multiValue(108105, 108106, 18745, 20134);

        this.data.stimulation = bits[0];
        this.data.canReceiveReward = !bits[1];

        const { elfId } = this.option;
        const levelStage = elfId <= 10 ? values[0] : values[1];
        const stageElfId = ((elfId - 1) % 9) * 3;

        this.data.unlockHard = Boolean(levelStage & (1 << (stageElfId + 2)));
        this.data.leftTimes = this.info.maxTimes - values[2];
        this.data.weeklyChallengeCount = values[3];

        console.log(this.data);

        if (this.data.state === ('award_error' as LevelState)) {
            this.logger(`${this.info.name}: 领取奖励出错`);
            return LevelState.STOP;
        }

        if (!this.data.unlockHard) {
            this.logger(`${this.info.name}: 未解锁困难难度`);
            this.data.success = true;
            return LevelState.STOP;
        } else if (this.data.leftTimes > 0) {
            this.logger(`${this.info.name}: 进入关卡`);
            return LevelState.BATTLE;
        } else {
            this.data.success = !this.data.canReceiveReward;
            if (this.data.weeklyChallengeCount >= 30 && this.data.canReceiveReward) {
                this.logger(`${this.info.name}: 领取奖励`);
                return LevelState.AWARD;
            }
            return LevelState.STOP;
        }
    }

    selectBattle() {
        return {
            pets: customData.cts,
            strategy: customData.strategy,
        } as ILevelBattleStrategy;
    }

    readonly actions: Record<string, () => Promise<void>> = {
        battle: async () => {
            Socket.sendByQueue(42396, [106, this.option.elfId, 2]);
        },

        award: async () => {
            try {
                await Socket.sendByQueue(42395, [106, 3, 0, 0]);
            } catch (error) {
                this.logger(error);
                this.data.state = 'award_error' as LevelState;
            }
        },
    };
}
