import { MOD_SCOPE_BUILTIN, PET_FRAGMENT_LEVEL_ID, VERSION } from '@/constants';
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
import type { IPetFragmentRunner, PetFragmentLevelData, PetFragmentOption } from './types';

export const metadata = {
    id: PET_FRAGMENT_LEVEL_ID,
    scope: MOD_SCOPE_BUILTIN,
    version: VERSION,
    description: '精灵因子',
    data: [] as PetFragmentOption[]
} satisfies SEAModMetadata;

export default function ({ logger, battle }: SEAModContext<typeof metadata>) {
    const taskMetadata = {
        name: '精灵因子',
        id: PET_FRAGMENT_LEVEL_ID
    };

    class PetFragmentRunner implements IPetFragmentRunner {
        get name() {
            return `精灵因子-${this.frag.name}`;
        }

        readonly designId: number;
        readonly frag: PetFragmentLevel;

        data: PetFragmentLevelData;
        logger = logger;

        constructor(public options: PetFragmentOption) {
            const LevelObj = engine.getPetFragmentLevelObj(options.id);

            if (!LevelObj) throw new Error(`未找到精灵因子关卡: ${options.id}`);

            this.frag = new PetFragmentLevel(LevelObj);
            this.designId = this.frag.id;

            this.data = { maxTimes: 3 } as PetFragmentLevelData;
            this.logger = logger.bind(logger, this.name);
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
            const { frag, data } = this;
            const values = await socket.multiValue(frag.values.openTimes, frag.values.failTimes, frag.values.progress);

            data.pieces = await engine.itemNum(frag.petFragmentItem);

            data.remainingTimes = data.maxTimes - values[0];
            data.failedTimes = values[1];
            data.curDifficulty = (values[2] >> 8) & 255;
            if (data.curDifficulty === Difficulty.NotSelected && this.options.difficulty) {
                data.curDifficulty = this.options.difficulty;
            }
            data.curPosition = values[2] >> 16;
            data.isChallenge = data.curDifficulty !== Difficulty.NotSelected && data.curPosition !== 0;
            data.progress = (data.curPosition / 5) * 100;

            switch (data.curDifficulty) {
                case Difficulty.Ease:
                    data.bosses = frag.level.ease;
                    break;
                case Difficulty.Normal:
                    data.bosses = frag.level.normal;
                    break;
                case Difficulty.Hard:
                    data.bosses = frag.level.hard;
                    break;
                default:
                    break;
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
                await socket.sendByQueue(41283, [this.designId, 4 + this.data.curDifficulty]);
                this.logger('执行一次扫荡');
            },
            battle: async () => {
                const checkData = await socket.sendByQueue(41284, [this.designId, this.data.curDifficulty]);
                const check = new DataView(checkData!).getUint32(0);
                if (check === 0) {
                    await socket.sendByQueue(41282, [this.designId, this.data.curDifficulty]);
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
            runner(options) {
                return new PetFragmentRunner(options as unknown as PetFragmentOption);
            }
        })
    ];

    return {
        tasks
    } as SEAModExport;
}
