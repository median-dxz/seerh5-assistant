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
    const { meta, logger, battle } = await createModContext({
        meta: {
            id: 'Realm',
            scope: MOD_SCOPE_BUILTIN,
            version: VERSION,
            core: CORE_VERSION,
            description: '日常关卡',
        },
        defaultConfig: {
            ELF_KING_ID: {
                光王斯嘉丽: 2,
                水王沧岚: 8,
                自然王莫妮卡: 17,
                龙妈乔特鲁德: 6,
                草王茉蕊儿: 15,
                海瑟薇: 12,
                邪灵王摩哥斯: 14,
                格劳瑞: 9,
                战王: 13,
                秘王: 7,
            },
            LevelCourageTower: {
                stimulation: false,
                sweep: false,
            },
            LevelElfKingsTrial: {
                stimulation: false,
                sweep: false,
                elfId: 15,
            },
            LevelExpTraining: {
                stimulation: false,
                sweep: false,
            },
            LevelStudyTraining: {
                stimulation: false,
                sweep: false,
            },
            LevelTitanHole: {
                stimulation: false,
                sweep: false,
            },
            LevelXTeamRoom: {
                sweep: false,
            },
        },
    });

    return {
        meta,
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
                        maxTimes: 1,
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
                        },
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
                },
            ],
        },
    } as ModExport;
}
