import { LevelAction, Socket } from 'sea-core';

import type { AnyFunction, ILevelBattle, LevelMeta, LevelData as SEALevelData } from 'sea-core';

interface LevelData extends SEALevelData {
    stimulation: boolean;
    rewardReceived: boolean;
}

interface LevelOption {
    stimulation: boolean;
    sweep: boolean;
}

export default (logger: AnyFunction, battle: (name: string) => ILevelBattle) => {
    return class LevelStudyTraining implements SEAL.LevelRunner<LevelData> {
        data: LevelData = {
            remainingTimes: 0,
            progress: 0,
            rewardReceived: false,
            stimulation: false,
        };

        static readonly meta: LevelMeta = {
            name: '学习力训练场',
            maxTimes: 6,
            id: 'LevelStudyTraining',
        };

        get meta() {
            return LevelStudyTraining.meta;
        }

        get name() {
            return LevelStudyTraining.meta.name;
        }

        logger = logger;

        constructor(public option: LevelOption) {}

        async update() {
            this.logger(`${this.meta.name}: 更新关卡信息...`);
            const bits = (await Socket.bitSet(637, 1000572)).map(Boolean);
            const buf = await Socket.sendByQueue(42397, [115]);
            const realmInfo = new DataView(buf!);

            this.data.stimulation = bits[0];
            this.data.rewardReceived = bits[1];
            this.data.remainingTimes = this.meta.maxTimes - realmInfo.getUint32(8);

            if (!this.data.rewardReceived) {
                if (this.data.remainingTimes > 0) {
                    this.logger(`${this.meta.name}: 进入关卡`);
                    return LevelAction.BATTLE;
                } else {
                    this.logger(`${this.meta.name}: 领取奖励`);
                    return LevelAction.AWARD;
                }
            } else {
                this.logger(`${this.meta.name}日任完成`);
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
                await Socket.sendByQueue(42395, [115, 3, 0, 0]);
            },
        };
    };
};
