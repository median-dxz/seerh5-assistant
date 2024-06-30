import { engine } from '@sea/core';
import type { Command, SEAModContext, SEAModExport, SEAModMetadata } from '@sea/mod-type';

import { coreVersion } from '../common/coreVersion';
import Icon from './all_inclusive.svg?raw';

export const metadata = {
    id: '对战谱尼',
    scope: 'median',
    core: coreVersion,
    version: '1.0.0'
} satisfies SEAModMetadata;

export default async function FightPuni(ctx: SEAModContext<typeof metadata>) {
    const FightPuni: Command = {
        name: 'FightPuni',
        icon: Icon,
        description: '对战谱尼',
        handler() {
            engine.fightBoss(6730);
        }
    };

    return {
        commands: [FightPuni]
    } satisfies SEAModExport;
}
