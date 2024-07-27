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
        metadata: {
            name: '勇者之塔',

            id: 'LevelCourageTower'
        },
        configSchema: {
            stimulation: {
                name: '双倍',
                type: 'checkbox',
                default: false
            },
            sweep: {
                name: '扫荡',
                type: 'checkbox',
                default: false
            },
            battle: {
                name: '对战方案',
                type: 'battle',
                default: 'auto'
            }
        },
        runner: (options) => ({
            logger,
            data: {
                maxTimes: 5,
                remainingTimes: 0,
                progress: 0,
                rewardReceived: false,
                stimulation: false
            } as Data,
            async update() {
                const bits = (await socket.bitSet(636, 1000577)).map(Boolean);
                const buf = await socket.sendByQueue(42397, [117]);
                const realmInfo = new DataView(buf!);

                this.data.stimulation = bits[0];
                this.data.rewardReceived = bits[1];
                this.data.remainingTimes = this.data.maxTimes - realmInfo.getUint32(8);
            },
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
            selectLevelBattle() {
                return battle(options.battle);
            },
            actions: {
                async battle() {
                    await socket.sendByQueue(CommandID.FIGHT_H5_PVE_BOSS, [117, 30, 1]);
                },
                async award() {
                    await socket.sendByQueue(42395, [117, 4, 0, 0]);
                },
                async sweep() {
                    // TODO
                }
            }
        })
    });
