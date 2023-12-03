import { LevelAction, Socket } from 'sea-core';

import type { AnyFunction, ILevelBattle, ILevelRunner, LevelData as SEALevelData } from 'sea-core';

interface LevelData extends SEALevelData {
    stimulation: boolean;
    rewardReceived: boolean;
}

interface LevelOption {
    stimulation: boolean;
    sweep: boolean;
}

export default (logger: AnyFunction, battle: (name: string) => ILevelBattle) => {
    return class LevelStudyTraining implements ILevelRunner<LevelData> {
        data: LevelData = {
            leftTimes: 0,
            state: LevelAction.STOP,
            success: false,
            rewardReceived: false,
            stimulation: false,
        };

        static readonly meta: SEAL.LevelMeta = {
            name: '学习力训练场',
            maxTimes: 6,
            id: 'LevelStudyTraining',
        };

        get meta() {
            return LevelStudyTraining.meta;
        }

        logger = logger;

        constructor(public option: LevelOption) {}

        async updater() {
            this.logger(`${this.meta.name}: 更新关卡信息...`);
            const bits = (await Socket.bitSet(637, 1000572)).map(Boolean);
            const buf = await Socket.sendByQueue(42397, [115]);
            const realmInfo = new DataView(buf!);

            this.data.stimulation = bits[0];
            this.data.rewardReceived = bits[1];
            this.data.leftTimes = this.meta.maxTimes - realmInfo.getUint32(8);

            this.data.success = this.data.rewardReceived;

            if (!this.data.rewardReceived) {
                if (this.data.state === 'award_error') {
                    return LevelAction.STOP;
                }

                if (this.data.leftTimes > 0) {
                    this.logger(`${this.meta.name}: 进入关卡`);
                    return LevelAction.BATTLE;
                } else {
                    this.logger(`${this.meta.name}: 领取奖励`);
                    return LevelAction.AWARD;
                }
            } else {
                this.logger(`${this.meta.name}日任完成`);
                this.data.success = true;
                return LevelAction.STOP;
            }
        }

        selectBattle() {
            return battle('LevelStudyTraining');
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
                    this.data.state = 'award_error';
                }
            },
        };
    };
};
