import { DifficultyText, MOD_SCOPE_BUILTIN, PET_FRAGMENT_LEVEL_ID, VERSION } from '@/constants';
import {
    PetFragmentLevelDifficulty as Difficulty,
    LevelAction,
    PetFragmentLevel,
    delay,
    engine,
    socket
} from '@sea/core';
import type { SEAModContext, SEAModExport, SEAModMetadata } from '@sea/mod-type';
import { task } from '@sea/mod-type';
import type { IPetFragmentRunner, PetFragmentLevelData, PetFragmentOptions } from './types';

export const metadata = {
    id: PET_FRAGMENT_LEVEL_ID,
    scope: MOD_SCOPE_BUILTIN,
    version: VERSION,
    description: '精灵因子',
    data: [] as PetFragmentOptions[]
} satisfies SEAModMetadata;

declare const config: {
    xml: {
        getAnyRes: (name: 'new_super_design') => {
            Root: {
                Design: seerh5.PetFragmentLevelObj[];
            };
        };
    };
};

export default function ({ logger, battle }: SEAModContext<typeof metadata>) {
    const taskMetadata = {
        name: '精灵因子',
        id: PET_FRAGMENT_LEVEL_ID
    };

    class PetFragmentRunner implements IPetFragmentRunner {
        get name() {
            return `精灵因子-${this.level.name.split(' ')[1]}: ${DifficultyText[this.options.difficulty]}`;
        }

        readonly designId: number;
        readonly level: PetFragmentLevel;

        data: PetFragmentLevelData;
        logger = logger;

        constructor(public options: PetFragmentOptions) {
            const allLevelObj = config.xml.getAnyRes('new_super_design').Root.Design;
            const LevelObj = allLevelObj.find((level) => level.ID === options.id);

            if (!LevelObj) throw new Error(`未找到精灵因子关卡: ${options.id}`);

            this.level = new PetFragmentLevel(LevelObj);
            this.designId = this.level.id;

            this.data = { maxTimes: 3 } as PetFragmentLevelData;
            this.logger = (msg: string) => logger(`${this.name}: ${msg}`);
        }

        selectLevelBattle() {
            const battleStrategy = battle(this.options.battle.at(this.data.curPosition)!);
            const beforeBattle = async () => {
                await delay(Math.round(Math.random() * 1000) + 5000);
                return battleStrategy.beforeBattle?.();
            };
            return { ...battleStrategy, beforeBattle };
        }

        async update() {
            const { level, data } = this;
            const values = await socket.multiValue(
                level.values.openTimes,
                level.values.failTimes,
                level.values.progress,
                level.values.gain
            );

            data.piecesOwned = await engine.itemNum(level.petFragment.itemId);

            data.remainingTimes = data.maxTimes - values[0];
            data.failedTimes = values[1];
            data.curDifficulty = (values[2] >> 8) & 255;
            data.curPosition = values[2] >> 16;
            data.isChallenge = data.curDifficulty !== Difficulty.NotSelected && data.curPosition !== 0;
            data.progress = (data.curPosition / 5) * 100;

            data.canSweep = false;
            if (data.curDifficulty === Difficulty.NotSelected) {
                data.canSweep = Boolean((values[3] >> (4 + this.options.difficulty)) & 1);
            }
        }

        next() {
            const data = this.data;

            if (data.isChallenge || data.remainingTimes > 0) {
                if (this.options.sweep) {
                    return 'sweep';
                } else {
                    return LevelAction.BATTLE;
                }
            }

            return LevelAction.STOP;
        }

        readonly actions = {
            sweep: async () => {
                if (!this.data.canSweep) {
                    const err = `不满足扫荡条件`;
                    BubblerManager.getInstance().showText(err);
                    throw new Error(err);
                }
                await socket.sendByQueue(41283, [this.designId, 4 + this.options.difficulty]);
                this.logger('执行一次扫荡');
            },
            battle: async () => {
                if (this.data.isChallenge && this.options.difficulty !== this.data.curDifficulty) {
                    const err = `正在进行其他难度的挑战: ${this.data.curDifficulty}`;
                    BubblerManager.getInstance().showText(err);
                    throw new Error(err);
                }
                const checkData = await socket.sendByQueue(41284, [this.designId, this.options.difficulty]);
                const check = new DataView(checkData!).getUint32(0);
                if (check === 0) {
                    await socket.sendByQueue(41282, [this.designId, this.options.difficulty]);
                } else {
                    const err = `出战情况不合法: ${check}`;
                    BubblerManager.getInstance().showText(err);
                    throw new Error(err);
                }
            }
        };
    }

    const tasks = [
        task({
            metadata: taskMetadata,
            runner(options: never) {
                return new PetFragmentRunner(options);
            }
        })
    ];

    return {
        tasks
    } as SEAModExport;
}
