import { LevelState, Socket } from 'sea-core';

import type { ILevelBattle, ILevelRunner, LevelData as SEALevelData, LevelMeta as SEALevelInfo } from 'sea-core';

import { SEAModuleLogger } from '@/utils/logger';
import dataProvider from './data';

const customData = dataProvider['LevelCourageTower'];

interface LevelData extends SEALevelData {
    stimulation: boolean;
    rewardReceived: boolean;
}

interface LevelOption {
    stimulation: boolean;
    sweep: boolean;
}

export class LevelCourageTower implements ILevelRunner<LevelData, SEALevelInfo> {
    data: LevelData = {
        leftTimes: 0,
        state: LevelState.STOP,
        success: false,
        rewardReceived: false,
        stimulation: false,
    };

    readonly meta = {
        name: '勇者之塔',
        maxTimes: 5,
    };

    option: LevelOption;

    logger = SEAModuleLogger('勇者之塔', 'info');

    constructor(option: LevelOption) {
        this.option = option;
    }

    async updater() {
        const bits = (await Socket.bitSet(636, 1000577)).map(Boolean);
        const buf = await Socket.sendByQueue(42397, [117]);
        const realmInfo = new DataView(buf!);

        this.data.stimulation = bits[0];
        this.data.rewardReceived = bits[1];
        this.data.leftTimes = this.meta.maxTimes - realmInfo.getUint32(8);

        console.log(this.data);

        this.data.success = this.data.rewardReceived;

        if (!this.data.rewardReceived) {
            if (this.data.state === ('award_error' as LevelState)) {
                return LevelState.STOP;
            }

            if (this.data.leftTimes > 0) {
                this.logger(`${this.meta.name}: 进入关卡`);
                return LevelState.BATTLE;
            } else {
                this.logger(`${this.meta.name}: 领取奖励`);
                return LevelState.AWARD;
            }
        } else {
            this.logger(`${this.meta.name}日任完成`);
            this.data.success = true;
            return LevelState.STOP;
        }
    }

    selectBattle() {
        return {
            pets: customData.cts,
            strategy: customData.strategy,
        } as ILevelBattle;
    }

    readonly actions: Record<string, () => Promise<void>> = {
        battle: async () => {
            Socket.sendByQueue(CommandID.FIGHT_H5_PVE_BOSS, [117, 30, 1]);
        },

        award: async () => {
            try {
                await Socket.sendByQueue(42395, [117, 4, 0, 0]);
            } catch (error) {
                this.logger(error);
                this.data.state = 'award_error' as LevelState;
            }
        },
    };
}
