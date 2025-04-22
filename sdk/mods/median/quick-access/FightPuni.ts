import { scope } from '@/median/constants.json';
import { engine } from '@sea/core';
import type { Command, SEAModContext, SEAModExport, SEAModMetadata } from '@sea/mod-type';
import Icon1 from './all_inclusive.svg?raw';
import Icon2 from './open_in_browser.svg?raw';

export const metadata = {
    id: '对战谱尼',
    scope,
    version: '1.0.0'
} satisfies SEAModMetadata;

export default function FightPuni(ctx: SEAModContext<typeof metadata>): SEAModExport {
    const FightPuni: Command = {
        name: 'fightPuni',
        icon: Icon1,
        description: '对战谱尼',
        handler() {
            engine.fightBoss(6730);
        }
    };

    const OpenPanels: Command[] = [
        {
            name: 'openPanel:team',
            icon: Icon2,
            description: '战队',
            handler() {
                ModuleManager.showModule('team');
            }
        },
        {
            name: 'openPanel:pveEnterPanel',
            icon: Icon2,
            description: 'PVE入口',
            handler() {
                ModuleManager.showModule('pveEnterPanel');
            }
        }
    ];

    return {
        commands: [FightPuni, ...OpenPanels]
    };
}
