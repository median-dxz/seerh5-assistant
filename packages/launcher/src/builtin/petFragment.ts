import { MOD_SCOPE_BUILTIN, VERSION } from '@/constants';
import type { IPetFragmentRunner, PetFragmentOption } from '@/views/Automation/PetFragmentLevel';
import {
    PetFragmentLevelDifficulty as Difficulty,
    Engine,
    PetFragmentLevel,
    Socket,
    delay,
    type IPFLevelBoss,
    type LevelMeta,
} from 'sea-core';
import { LevelAction, type ILevelRunner, type LevelData as SEALevelData } from 'sea-core/level';

interface LevelData extends SEALevelData {
    pieces: number;
    failedTimes: number;
    curDifficulty: Difficulty;
    curPosition: number;
    isChallenge: boolean;
    bosses: IPFLevelBoss[];
}

export default async function (createModContext: SEAL.createModContext) {
    const { meta, logger } = await createModContext({
        meta: {
            id: 'PetFragmentLevel',
            scope: MOD_SCOPE_BUILTIN,
            version: VERSION,
            description: '精灵因子',
        },
    });

    class PetFragmentRunner implements ILevelRunner<LevelData>, IPetFragmentRunner {
        static readonly meta: LevelMeta = {
            maxTimes: 3, //TODO 除了静态进度指示器, 关卡内部可以额外有动态进度指示器
            name: '精灵因子',
            id: meta.id,
        };

        get meta() {
            return PetFragmentRunner.meta;
        }

        readonly designId: number;
        readonly frag: PetFragmentLevel;

        data: LevelData;
        logger = logger;

        constructor(public option: PetFragmentOption) {
            this.option = option;
            this.option.battle = this.option.battle.map((strategy) => {
                const beforeBattle = async () => {
                    await delay(Math.round(Math.random() * 1000) + 5000);
                    return strategy.beforeBattle?.();
                };
                return { ...strategy, beforeBattle };
            });

            const LevelObj: seerh5.PetFragmentLevelObj = config.xml
                .getAnyRes('new_super_design')
                .Root.Design.find((r: seerh5.PetFragmentLevelObj) => r.ID === option.id);

            this.frag = new PetFragmentLevel(LevelObj);
            this.designId = this.frag.id;

            this.data = { success: false } as LevelData;
            this.logger = logger.bind(logger, `精灵因子-${this.frag.name}: `);
        }

        selectBattle() {
            return this.option.battle.at(this.data.curPosition)!;
        }

        async updater() {
            const { frag, data } = this;
            const values = await Socket.multiValue(frag.values.openTimes, frag.values.failTimes, frag.values.progress);

            data.pieces = await Engine.itemNum(frag.petFragmentItem);

            data.leftTimes = this.meta.maxTimes - values[0];
            data.failedTimes = values[1];
            data.curDifficulty = (values[2] >> 8) & 255;
            if (data.curDifficulty === Difficulty.NotSelected && this.option.difficulty) {
                data.curDifficulty = this.option.difficulty;
            }
            data.curPosition = values[2] >> 16;
            data.isChallenge = data.curDifficulty !== 0 && data.curPosition !== 0;
            switch (data.curDifficulty) {
                case Difficulty.Ease:
                    data.bosses = frag.level.ease;
                    break;
                case Difficulty.Normal:
                    data.bosses = frag.level.ease;
                    break;
                case Difficulty.Hard:
                    data.bosses = frag.level.ease;
                    break;
                default:
                    break;
            }
            this.data = { ...this.data };

            if (data.isChallenge || data.leftTimes > 0) {
                if (this.option.sweep) {
                    return 'sweep';
                } else {
                    return LevelAction.BATTLE;
                }
            } else {
                this.data.success = true;
                return LevelAction.STOP;
            }
        }

        readonly actions: Record<string, () => Promise<void>> = {
            sweep: async () => {
                await Socket.sendByQueue(41283, [this.designId, 4 + this.data.curDifficulty]);
                this.logger('执行一次扫荡');
            },
            battle: async () => {
                const checkData = await Socket.sendByQueue(41284, [this.designId, this.data.curDifficulty]);
                const check = new DataView(checkData!).getUint32(0);
                if (check === 0) {
                    Socket.sendByQueue(41282, [this.designId, this.data.curDifficulty]);
                } else {
                    const err = `出战情况不合法: ${check}`;
                    BubblerManager.getInstance().showText(err);
                    throw new Error(err);
                }
            },
        };
    }

    return {
        meta,
        exports: {
            level: [PetFragmentRunner],
        },
    } satisfies SEAL.ModExport;
}
