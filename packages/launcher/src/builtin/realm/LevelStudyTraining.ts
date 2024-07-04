import type { AnyFunction, LevelBattle } from '@sea/core';
import type { LevelData } from '@sea/mod-type';

import { LevelAction, socket } from '@sea/core';
import { task } from '@sea/mod-type';

export interface Data extends LevelData {
    stimulation: boolean;
    rewardReceived: boolean;
}

export default (logger: AnyFunction, battle: (name: string) => LevelBattle) =>
    task({
        meta: {
            name: '学习力训练场',
            maxTimes: 6,
            id: 'LevelStudyTraining'
        },
        configSchema: {
            stimulation: {
                name: '学习力双倍',
                type: 'checkbox',
                default: false
            },
            sweep: {
                name: '学习力扫荡',
                type: 'checkbox',
                default: false
            }
        },
        runner: (meta, options) => ({
            logger,
            data: {
                remainingTimes: 0,
                progress: 0,
                rewardReceived: false,
                stimulation: false
            } as Data,
            next() {
                if (!this.data.rewardReceived) {
                    if (this.data.remainingTimes > 0) {
                        return options.sweep ? 'sweep' : LevelAction.BATTLE;
                    } else {
                        return LevelAction.AWARD;
                    }
                }
                return LevelAction.STOP;
            },
            async update() {
                const bits = (await socket.bitSet(637, 1000572)).map(Boolean);
                const buf = await socket.sendByQueue(42397, [115]);
                const realmInfo = new DataView(buf!);

                this.data.stimulation = bits[0];
                this.data.rewardReceived = bits[1];
                this.data.remainingTimes = meta.maxTimes - realmInfo.getUint32(8);
            },
            selectLevelBattle() {
                return battle('LevelStudyTraining');
            },
            actions: {
                battle: async () => {
                    await socket.sendByQueue(CommandID.FIGHT_H5_PVE_BOSS, [115, 6, 1]);
                },
                award: async () => {
                    await socket.sendByQueue(42395, [115, 3, 0, 0]);
                },
                async sweep() {
                    // TODO
                }
            }
        })
    });
