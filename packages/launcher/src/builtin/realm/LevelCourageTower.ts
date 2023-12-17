import type { AnyFunction, LevelMeta } from 'sea-core';
import { LevelAction, Socket } from 'sea-core';

import type { ILevelBattle, LevelData as SEALevelData } from 'sea-core';

interface LevelData extends SEALevelData {
    stimulation: boolean;
    rewardReceived: boolean;
}

export interface LevelOption {
    stimulation: boolean;
    sweep: boolean;
}

export default (logger: AnyFunction, battle: (name: string) => ILevelBattle) => {
    class LevelCourageTower implements SEAL.LevelRunner<LevelData> {
        data: LevelData = {
            remainingTimes: 0,
            progress: 0,
            rewardReceived: false,
            stimulation: false,
        };

        static readonly meta: LevelMeta = {
            name: '勇者之塔',
            maxTimes: 5,
            id: 'LevelCourageTower',
        };

        get meta() {
            return LevelCourageTower.meta;
        }

        get name() {
            return LevelCourageTower.meta.name;
        }

        logger = logger;

        constructor(public option: LevelOption) {}

        async update() {
            const bits = (await Socket.bitSet(636, 1000577)).map(Boolean);
            const buf = await Socket.sendByQueue(42397, [117]);
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
            return battle('LevelCourageTower');
        }

        readonly actions: Record<string, () => Promise<void>> = {
            battle: async () => {
                Socket.sendByQueue(CommandID.FIGHT_H5_PVE_BOSS, [117, 30, 1]);
            },

            award: async () => {
                await Socket.sendByQueue(42395, [117, 4, 0, 0]);
            },
        };
    }

    return LevelCourageTower;
};
