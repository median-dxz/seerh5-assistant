import { LevelState, Socket } from 'sea-core';

import type { ILevelBattleStrategy, ILevelRunner, LevelData as SEALevelData, LevelInfo as SEALevelInfo } from 'sea-core';

import { SEAModuleLogger } from '@sea/launcher/utils/logger';
import dataProvider from './data';

const customData = dataProvider['LevelStudyTraining'];

interface LevelData extends SEALevelData {
    stimulation: boolean;
    rewardReceived: boolean;
}

interface LevelOption {
    stimulation: boolean;
    sweep: boolean;
}

export class LevelStudyTraining implements ILevelRunner<LevelData, SEALevelInfo> {
    data: LevelData = {
        leftTimes: 0,
        state: LevelState.STOP,
        success: false,
        rewardReceived: false,
        stimulation: false,
    };

    readonly info = {
        name: '学习力训练场',
        maxTimes: 6,
    };

    option: LevelOption;

    logger = SEAModuleLogger('经验训练场', 'info');

    constructor(option: LevelOption) {
        this.option = option;
    }

    async updater() {
        this.logger(`${this.info.name}: 更新关卡信息...`);
        const bits = (await Socket.bitSet(637, 1000572)).map(Boolean);
        const buf = await Socket.sendByQueue(42397, [115]);
        const realmInfo = new DataView(buf!);

        this.data.stimulation = bits[0];
        this.data.rewardReceived = bits[1];
        this.data.leftTimes = this.info.maxTimes - realmInfo.getUint32(8);

        this.data.success = this.data.rewardReceived;

        if (!this.data.rewardReceived) {
            if (this.data.state === ('award_error' as LevelState)) {
                return LevelState.STOP;
            }

            if (this.data.leftTimes > 0) {
                this.logger(`${this.info.name}: 进入关卡`);
                return LevelState.BATTLE;
            } else {
                this.logger(`${this.info.name}: 领取奖励`);
                return LevelState.AWARD;
            }
        } else {
            this.logger(`${this.info.name}日任完成`);
            this.data.success = true;
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
            Socket.sendByQueue(CommandID.FIGHT_H5_PVE_BOSS, [115, 6, 1]);
        },

        award: async () => {
            try {
                await Socket.sendByQueue(42395, [115, 3, 0, 0]);
            } catch (error) {
                this.logger(error);
                this.data.state = 'award_error' as LevelState;
            }
        },
    };
}
