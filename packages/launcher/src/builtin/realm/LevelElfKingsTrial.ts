import { LevelAction, Socket } from 'sea-core';

import type { AnyFunction, ILevelBattle, ILevelRunner, LevelData as SEALevelData } from 'sea-core';

interface LevelData extends SEALevelData {
    stimulation: boolean;
    unlockHard: boolean;
    canReceiveReward: boolean;
    weeklyChallengeCount: number;
}

interface LevelOption {
    stimulation: boolean;
    sweep: boolean;
    elfId: number;
}

export default (logger: AnyFunction, battle: (name: string) => ILevelBattle) => {
    return class LevelElfKingsTrial implements ILevelRunner<LevelData> {
        data: LevelData = {
            leftTimes: 0,
            state: LevelAction.STOP,
            success: false,
            stimulation: false,
            unlockHard: false,
            canReceiveReward: false,
            weeklyChallengeCount: 0,
        };

        static readonly meta: SEAL.LevelMeta = {
            name: '精灵王的试炼',
            maxTimes: 6,
            id: 'LevelElfKingsTrial',
        };

        get meta() {
            return LevelElfKingsTrial.meta;
        }

        logger = logger;

        constructor(public option: LevelOption) {}

        async updater() {
            const bits = (await Socket.bitSet(8832, 2000037)).map(Boolean);
            const values = await Socket.multiValue(108105, 108106, 18745, 20134);

            this.data.stimulation = bits[0];
            this.data.canReceiveReward = !bits[1];

            const { elfId } = this.option;
            const levelStage = elfId <= 10 ? values[0] : values[1];
            const stageElfId = ((elfId - 1) % 9) * 3;

            this.data.unlockHard = Boolean(levelStage & (1 << (stageElfId + 2)));
            this.data.leftTimes = this.meta.maxTimes - values[2];
            this.data.weeklyChallengeCount = values[3];

            console.log(this.data);

            if (this.data.state === 'award_error') {
                this.logger(`${this.meta.name}: 领取奖励出错`);
                return LevelAction.STOP;
            }

            if (!this.data.unlockHard) {
                this.logger(`${this.meta.name}: 未解锁困难难度`);
                this.data.success = true;
                return LevelAction.STOP;
            } else if (this.data.leftTimes > 0) {
                this.logger(`${this.meta.name}: 进入关卡`);
                return LevelAction.BATTLE;
            } else {
                this.data.success = !this.data.canReceiveReward;
                if (this.data.weeklyChallengeCount >= 30 && this.data.canReceiveReward) {
                    this.logger(`${this.meta.name}: 领取奖励`);
                    return LevelAction.AWARD;
                }
                return LevelAction.STOP;
            }
        }

        selectBattle() {
            return battle('LevelElfKingsTrial');
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
                    this.data.state = 'award_error';
                }
            },
        };
    };
};
