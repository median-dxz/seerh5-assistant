import { LevelAction, socket } from '@sea/core';

import type { AnyFunction, ILevelBattle, LevelMeta, LevelData as SEALevelData } from '@sea/core';

interface LevelData extends SEALevelData {
    stimulation: boolean;
    rewardReceived: boolean;
}

interface LevelOption {
    stimulation: boolean;
    sweep: boolean;
}

export default (logger: AnyFunction, battle: (name: string) => ILevelBattle) => {
    return class LevelExpTraining implements SEAL.TaskRunner<LevelData> {
        data: LevelData = {
            remainingTimes: 0,
            progress: 0,
            rewardReceived: false,
            stimulation: false,
        };

        static readonly meta: LevelMeta = {
            name: '经验训练场',
            maxTimes: 6,
            id: 'LevelExpTraining',
        };

        get meta() {
            return LevelExpTraining.meta;
        }

        get name() {
            return LevelExpTraining.meta.name;
        }

        logger = logger;

        constructor(public option: LevelOption) {}

        async update() {
            const bits = (await socket.bitSet(639, 1000571)).map(Boolean);
            const buf = await socket.sendByQueue(42397, [116]);
            const realmInfo = new DataView(buf!);

            this.data.stimulation = bits[0];
            this.data.rewardReceived = bits[1];
            this.data.remainingTimes = this.meta.maxTimes - realmInfo.getUint32(8);
        }

        next(): string {
            if (!this.data.rewardReceived) {
                if (this.data.remainingTimes > 0) {
                    return LevelAction.BATTLE;
                } else {
                    return LevelAction.AWARD;
                }
            }
            
            return LevelAction.STOP;
        }

        selectLevelBattle() {
            return battle('LevelExpTraining');
        }

        readonly actions: Record<string, () => Promise<void>> = {
            battle: async () => {
                socket.sendByQueue(CommandID.FIGHT_H5_PVE_BOSS, [116, 6, 1]);
            },

            award: async () => {
                await socket.sendByQueue(42395, [116, 3, 0, 0]);
            },
        };
    };
};
