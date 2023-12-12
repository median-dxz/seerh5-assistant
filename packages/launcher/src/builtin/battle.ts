import { CORE_VERSION, MOD_SCOPE_BUILTIN, VERSION } from '@/constants';
import { Engine } from 'sea-core/engine';

export default async function builtinBattle(createContext: SEAL.createModContext) {
    const context = await createContext({
        meta: {
            id: 'builtin-battle',
            scope: MOD_SCOPE_BUILTIN,
            version: VERSION,
            core: CORE_VERSION,
            description: '内置战斗模型',
        },
    });

    const { ct, meta } = context;

    const battle: SEAL.Battle[] = [
        {
            name: '潘蒂表必先',
            pets: ['潘克多斯', '蒂朵', '帝皇之御', '魔钰', '月照星魂', '时空界皇'],
            beforeBattle: () => {
                return Engine.lowerHp(ct('潘克多斯', '蒂朵', '帝皇之御', '魔钰', '月照星魂', '时空界皇'));
            },
            strategy: '潘蒂表必先',
        },
        {
            name: '圣谱单挑',
            pets: ['圣灵谱尼'],
            strategy: '圣谱单挑',
        },
        {
            name: '圣谱先手',
            pets: ['圣灵谱尼'],
            strategy: '圣谱先手',
        },
        {
            name: '王哈单挑',
            pets: ['王之哈莫'],
            strategy: '王哈单挑',
        },
        {
            name: '蒂朵单挑',
            pets: ['蒂朵'],
            strategy: '王哈单挑',
        },
        {
            name: '千裳单挑',
            pets: ['千裳'],
            strategy: '千裳单挑',
        },
        {
            name: '索强攻',
            pets: ['鲁肃', '芳馨·茉蕊儿', '混沌魔君索伦森'],
            strategy: '索强攻',
        },
        {
            name: 'LevelXTeamRoom',
            pets: ['蒂朵', '六界帝神', '深渊狱神·哈迪斯'],
            strategy: 'LevelXTeamRoom',
        },
        {
            name: 'LevelExpTraining',
            pets: ['圣灵谱尼', '蒂朵', '幻影蝶'],
            strategy: 'LevelExpTraining',
        },
        {
            name: 'LevelStudyTraining',
            pets: ['幻影蝶', '艾欧丽娅', '千裳'],
            strategy: 'LevelStudyTraining',
        },
        {
            name: 'LevelCourageTower',
            pets: ['圣灵谱尼', '王之哈莫', '幻影蝶', '蒂朵'],
            strategy: 'LevelCourageTower',
        },
        {
            name: 'LevelTitanHole',
            pets: ['幻影蝶', '六界帝神', '深渊狱神·哈迪斯', '圣灵谱尼', '艾欧丽娅'],
            strategy: 'LevelTitanHole',
        },
        {
            name: 'LevelTitanHole_1',
            pets: ['艾欧丽娅', '幻影蝶', '六界帝神', '深渊狱神·哈迪斯', '圣灵谱尼'],
            strategy: 'LevelTitanHole',
        },
        {
            name: 'LevelElfKingsTrial',
            pets: ['幻影蝶', '六界帝神', '深渊狱神·哈迪斯'],
            strategy: 'LevelElfKingsTrial',
        },
    ];

    return {
        meta,
        exports: {
            battle,
        },
    } satisfies SEAL.ModExport;
}
