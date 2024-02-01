import { engine } from '@sea/core';
import type { Command, CreateModContext, ModExport } from '@sea/launcher';
import Icon from './all_inclusive.svg?raw';

export default async function FightPuni(createContext: CreateModContext) {
    const { meta } = await createContext({
        meta: {
            id: '对战谱尼',
            scope: 'median',
            core: '1.0.0-rc.1',
        },
    });

    const FightPuni: Command = {
        name: 'FightPuni',
        icon: Icon,
        description: '对战谱尼',
        handler() {
            engine.fightBoss(6730);
        },
    };

    return {
        meta,
        exports: {
            command: [FightPuni],
        },
    } satisfies ModExport;
}
