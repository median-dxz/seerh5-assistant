import type { AnyFunction, LevelBattle } from '@sea/core';
import type { LevelData, SEAConfigSchema } from '@sea/mod-type';

import { LevelAction, socket } from '@sea/core';
import { task } from '@sea/mod-type';

export interface Data extends LevelData {
    stimulation: boolean;
    unlockHard: boolean;
    canReceiveReward: boolean;
    weeklyChallengeCount: number;
}

const ELF_KINGS_LIST = {
    光王斯嘉丽: '2',
    水王沧岚: '8',
    自然王莫妮卡: '17',
    龙妈乔特鲁德: '6',
    草王茉蕊儿: '15',
    海瑟薇: '12',
    邪灵王摩哥斯: '14',
    格劳瑞: '9',
    战王: '13',
    秘王: '7'
};

export default (logger: AnyFunction, battle: (name: string) => LevelBattle) => {
    const meta = {
        name: '精灵王的试炼',
        id: 'LevelElfKingsTrial'
    };

    const configSchema = {
        elfKingId: {
            name: '精灵王',
            type: 'select',
            helperText: '自动日任要挑战的精灵王',
            default: '15',
            list: ELF_KINGS_LIST
        },
        stimulation: {
            name: '精灵王双倍',
            type: 'checkbox',
            default: false
        },
        sweep: {
            name: '精灵王扫荡',
            type: 'checkbox',
            default: false
        }
    } satisfies SEAConfigSchema;

    return task({
        metadata: meta,
        configSchema,
        runner: (options) => {
            const elfKingId = Number(options.elfKingId);
            return {
                logger,
                data: {
                    maxTimes: 6,
                    progress: 0,
                    remainingTimes: 0,
                    stimulation: false,
                    unlockHard: false,
                    canReceiveReward: false,
                    weeklyChallengeCount: 0
                } as Data,
                async update() {
                    const bits = (await socket.bitSet(8832, 2000037)).map(Boolean);
                    const values = await socket.multiValue(108105, 108106, 18745, 20134);

                    this.data.stimulation = bits[0];
                    this.data.canReceiveReward = !bits[1];

                    const levelStage = elfKingId <= 10 ? values[0] : values[1];
                    const stageElfId = ((elfKingId - 1) % 9) * 3;

                    this.data.unlockHard = Boolean(levelStage & (1 << (stageElfId + 2)));
                    this.data.remainingTimes = this.data.maxTimes - values[2];
                    this.data.weeklyChallengeCount = values[3];
                },
                next() {
                    if (!this.data.unlockHard) {
                        this.logger(`${meta.name}: 未解锁困难难度`);
                        return LevelAction.STOP;
                    } else if (this.data.remainingTimes > 0) {
                        return LevelAction.BATTLE;
                    } else {
                        if (this.data.weeklyChallengeCount >= 30 && this.data.canReceiveReward) {
                            return LevelAction.AWARD;
                        }
                        return LevelAction.STOP;
                    }
                },
                selectLevelBattle() {
                    return battle('LevelElfKingsTrial');
                },
                actions: {
                    async battle() {
                        await socket.sendByQueue(42396, [106, elfKingId, 2]);
                    },
                    async award() {
                        await socket.sendByQueue(42395, [106, 3, 0, 0]);
                    }
                }
            };
        }
    });
};
