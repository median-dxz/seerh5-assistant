import { MOD_SCOPE_BUILTIN, VERSION } from '@/constants';
import { delay, NOOP } from '@sea/core';
import type { SEAModContext, SEAModExport, SEAModMetadata } from '@sea/mod-type';
import { task } from '@sea/mod-type';
import LevelCourageTower from './LevelCourageTower';
import LevelElfKingsTrial from './LevelElfKingsTrial';
import LevelExpTraining from './LevelExpTraining';
import LevelStudyTraining from './LevelStudyTraining';
import LevelTitanHole from './LevelTitanHole';
import LevelXTeamRoom from './LevelXTeamRoom';

export const metadata = {
    id: 'realm',
    scope: MOD_SCOPE_BUILTIN,
    version: VERSION,
    description: '日常关卡'
} satisfies SEAModMetadata;

export default function realm({ logger, battle }: SEAModContext<typeof metadata>) {
    return {
        tasks: [
            LevelElfKingsTrial(logger, battle),
            LevelCourageTower(logger, battle),
            LevelExpTraining(logger, battle),
            LevelStudyTraining(logger, battle),
            LevelTitanHole(logger, battle),
            LevelXTeamRoom(logger, battle),
            task({
                metadata: { id: 'Test', name: '测试', maxTimes: 1 },
                runner() {
                    return {
                        data: {
                            progress: 0,
                            remainingTimes: 0,
                            customField: 'string'
                        },
                        selectLevelBattle() {
                            return battle('');
                        },
                        async update() {
                            await Promise.resolve();
                            this.data.progress += 33;
                        },
                        logger: NOOP,
                        next() {
                            if (this.data.progress >= 99) {
                                return 'stop';
                            }
                            return 'run';
                        },
                        actions: {
                            async run() {
                                await delay(3000);
                            }
                        }
                    };
                }
            })
        ] as const
    } satisfies SEAModExport;
}
