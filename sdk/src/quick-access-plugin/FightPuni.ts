import Icon from './all_inclusive.svg?raw';

export default async function FightPuni(createContext: SEAL.createModContext) {
    const { meta } = await createContext({
        meta: {
            id: '对战谱尼',
            scope: 'median',
            core: '0.7.4',
        },
    });

    const FightPuni: SEAL.Command = {
        name: 'FightPuni',
        icon: Icon,
        description: '对战谱尼',
        handler() {
            FightManager.fightNoMapBoss(6730);
        },
    };

    return {
        meta,
        exports: {
            command: [FightPuni],
        },
    } satisfies SEAL.ModExport;
}
