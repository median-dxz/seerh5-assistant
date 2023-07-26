import { SALevelState, SaModuleLogger, Socket, defaultStyle } from 'sa-core';

import type { ILevelBattleStrategy, ILevelRunner, SALevelData, SALevelInfo } from 'sa-core';

import dataProvider from './data';

const customData = dataProvider['LevelExpTraining'];

interface LevelData extends SALevelData {
    stimulation: boolean;
    rewardReceived: boolean;
}

interface LevelOption {
    stimulation: boolean;
    sweep: boolean;
}

export class LevelExpTraining implements ILevelRunner<LevelData, SALevelInfo> {
    data: LevelData = {
        leftTimes: 0,
        state: SALevelState.STOP,
        success: false,
        rewardReceived: false,
        stimulation: false,
    };

    readonly info = {
        name: '经验训练场',
        maxTimes: 6,
    };

    option: LevelOption;

    logger = SaModuleLogger('经验训练场', defaultStyle.core);

    constructor(option: LevelOption) {
        this.option = option;
    }

    async updater() {
        this.logger(`${this.info.name}: 更新关卡信息...`);
        const bits = (await Socket.bitSet(639, 1000571)).map(Boolean);
        const buf = await Socket.sendByQueue(42397, [116]);
        const realmInfo = new DataView(buf!);

        this.data.stimulation = bits[0];
        this.data.rewardReceived = bits[1];
        this.data.leftTimes = this.info.maxTimes - realmInfo.getUint32(8);

        this.data.success = this.data.rewardReceived;

        if (!this.data.rewardReceived) {
            if (this.data.state === ('award_error' as SALevelState)) {
                return SALevelState.STOP;
            }

            if (this.data.leftTimes > 0) {
                this.logger(`${this.info.name}: 进入关卡`);
                return SALevelState.BATTLE;
            } else {
                this.logger(`${this.info.name}: 领取奖励`);
                return SALevelState.AWARD;
            }
        } else {
            this.logger(`${this.info.name}日任完成`);
            this.data.success = true;
            return SALevelState.STOP;
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
            Socket.sendByQueue(CommandID.FIGHT_H5_PVE_BOSS, [116, 6, 1]);
        },

        award: async () => {
            try {
                await Socket.sendByQueue(42395, [116, 3, 0, 0]);
            } catch (error) {
                this.logger(error);
                this.data.state = 'award_error' as SALevelState;
            }
        },
    };
}
