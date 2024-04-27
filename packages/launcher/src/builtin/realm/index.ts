import { CORE_VERSION, MOD_SCOPE_BUILTIN, VERSION } from '@/constants';
import type { CreateModContext, LevelData, LevelMeta, ModExport, TaskRunner } from '@/sea-launcher';
import { NOOP, delay, type ILevelBattle, type ILevelRunner } from '@sea/core';
import LevelCourageTower from './LevelCourageTower';
import LevelElfKingsTrial from './LevelElfKingsTrial';
import LevelExpTraining from './LevelExpTraining';
import LevelStudyTraining from './LevelStudyTraining';
import LevelTitanHole from './LevelTitanHole';
import LevelXTeamRoom from './LevelXTeamRoom';

export default async function realm(createModContext: CreateModContext) {
    const { meta, logger, battle, configSchemas } = await createModContext({
        meta: {
            id: 'Realm',
            scope: MOD_SCOPE_BUILTIN,
            version: VERSION,
            core: CORE_VERSION,
            description: '日常关卡'
        },
        config: {
            'LevelElfKingsTrial.elfKing': {
                name: '精灵王',
                type: 'select',
                description: '自动日任要挑战的精灵王',
                list: {
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
                }
            },
            'LevelElfKingsTrial.elfKingStimulation': {
                name: '精灵王双倍',
                type: 'checkbox',
                default: false
            },
            'LevelElfKingsTrial.sweep': {
                name: '精灵王扫荡',
                type: 'checkbox',
                default: false
            },
            'LevelCourageTower.stimulation': {
                name: '勇者之塔双倍',
                type: 'checkbox',
                default: false
            },
            'LevelCourageTower.sweep': {
                name: '勇者之塔扫荡',
                type: 'checkbox',
                default: false
            },
            'LevelExpTraining.stimulation': {
                name: '经验双倍',
                type: 'checkbox',
                default: false
            },
            'LevelExpTraining.sweep': {
                name: '经验扫荡',
                type: 'checkbox',
                default: false
            },
            'LevelStudyTraining.stimulation': {
                name: '学习力双倍',
                type: 'checkbox',
                default: false
            },
            'LevelStudyTraining.sweep': {
                name: '学习力扫荡',
                type: 'checkbox',
                default: false
            },
            'LevelTitanHole.stimulation': {
                name: '泰坦矿洞双倍',
                type: 'checkbox',
                default: false
            },
            'LevelTitanHole.sweep': {
                name: '泰坦矿洞扫荡',
                type: 'checkbox',
                default: false
            },
            'LevelXTeamRoom.sweep': {
                name: 'X战队扫荡',
                type: 'checkbox',
                default: false
            }
        }
    });

    return {
        meta,
        configSchemas,
        exports: {
            task: [
                LevelCourageTower(logger, battle),
                LevelElfKingsTrial(logger, battle),
                LevelExpTraining(logger, battle),
                LevelStudyTraining(logger, battle),
                LevelTitanHole(logger, battle),
                LevelXTeamRoom(logger, battle),
                class Test implements TaskRunner<LevelData> {
                    static readonly meta: LevelMeta = {
                        id: 'Test',
                        name: '测试',
                        maxTimes: 1
                    };
                    get meta(): LevelMeta {
                        return Test.meta;
                    }
                    get name(): string {
                        return Test.meta.name;
                    }
                    data: LevelData = { remainingTimes: 0, progress: 0 };
                    actions: Record<string, <T extends object, R extends ILevelRunner<T>>(this: R) => Promise<void>> = {
                        run: async () => {
                            this.data.progress++;
                            await delay(3000);
                        }
                    };
                    async update() {}
                    next(): string {
                        if (this.data.progress === 3) {
                            return 'stop';
                        }
                        return 'run';
                    }
                    selectLevelBattle?(): ILevelBattle {
                        return battle('');
                    }
                    logger = NOOP;
                }
            ]
        }
    } as ModExport;
}
