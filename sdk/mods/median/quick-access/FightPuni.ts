import { scope } from '@/median/constants.json';
import { engine } from '@sea/core';
import type { Command, SEAModContext, SEAModExport, SEAModMetadata } from '@sea/mod-type';
import Icon from './all_inclusive.svg?raw';

export const metadata = {
    id: '对战谱尼',
    scope,
    version: '1.0.0'
} satisfies SEAModMetadata;

export default function FightPuni(ctx: SEAModContext<typeof metadata>): SEAModExport {
    const FightPuni: Command = {
        name: 'fightPuni',
        icon: Icon,
        description: '对战谱尼',
        handler() {
            engine.fightBoss(6730);
        }
    };

    return {
        commands: [FightPuni]
    };
}
