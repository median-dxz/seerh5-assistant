import { scope } from '@/median/constants.json';
import type { SEAModContext, SEAModExport, SEAModMetadata } from '@sea/mod-type';
import LevelCourageTower from './LevelCourageTower';
import LevelElfKingsTrial from './LevelElfKingsTrial';
import LevelExpTraining from './LevelExpTraining';
import LevelStudyTraining from './LevelStudyTraining';
import LevelTitanHole from './LevelTitanHole';
import LevelXTeamRoom from './LevelXTeamRoom';

export const metadata = {
    id: 'Realm',
    scope,
    version: '1.0.0',
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
            LevelXTeamRoom(logger, battle)
        ] as const
    } satisfies SEAModExport;
}
