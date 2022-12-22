import type { AutoBattle } from '@sa-core/battle-module';
import { generateStrategy } from '@sa-core/battle-module';

interface LevelPetsData {
    [levelName: string]: {
        pets: Array<{
            catchTime: number;
            name: string;
        }>;
        strategy: AutoBattle.MoveModule;
    };
}

const data: LevelPetsData = {
    LevelXTeamRoom: {
        pets: [
            {
                name: '蒂朵',
                catchTime: 1656056275,
            },
            {
                name: '深渊狱神·哈迪斯',
                catchTime: 1656945596,
            },
            {
                name: '六界帝神',
                catchTime: 1657863632,
            },
        ],
        strategy: generateStrategy(['幻梦芳逝', '剑挥四方', '破寂同灾'], ['蒂朵', '六界帝神', '深渊狱神·哈迪斯']),
    },
    LevelExpTraining: {
        pets: [
            {
                name: '幻影蝶',
                catchTime: 1656055512,
            },
            {
                name: '蒂朵',
                catchTime: 1656056275,
            },
            {
                name: '王之哈莫',
                catchTime: 1656302059,
            },
            {
                name: '深渊狱神·哈迪斯',
                catchTime: 1656945596,
            },
        ],
        strategy: generateStrategy(['时空牵绊', '王·龙子盛威决', '破寂同灾', '竭血残蝶'], ['幻影蝶', '蒂朵']),
    },
    LevelStudyTraining: {
        pets: [
            {
                name: '幻影蝶',
                catchTime: 1656055512,
            },
            {
                name: '艾欧丽娅',
                catchTime: 1655101462,
            },
            {
                name: '王之哈莫',
                catchTime: 1656302059,
            },
            {
                name: '千裳',
                catchTime: 1657039061,
            },
        ],
        strategy: generateStrategy(['有女初长成', '王·龙子盛威决', '竭血残蝶'], ['幻影蝶', '艾欧丽娅', '千裳']),
    },
    LevelCourageTower: {
        pets: [
            {
                name: '幻影蝶',
                catchTime: 1656055512,
            },
            {
                name: '王之哈莫',
                catchTime: 1656302059,
            },
            {
                name: '蒂朵',
                catchTime: 1656056275,
            },
        ],
        strategy: generateStrategy(['王·龙子盛威决', '竭血残蝶', '时空牵绊'], ['幻影蝶', '蒂朵']),
    },
    LevelTitanHole: {
        pets: [
            {
                name: '幻影蝶',
                catchTime: 1656055512,
            },
            {
                name: '深渊狱神·哈迪斯',
                catchTime: 1656945596,
            },
            {
                name: '六界帝神',
                catchTime: 1657863632,
            },
            {
                name: '艾欧丽娅',
                catchTime: 1655101462,
            },
        ],
        strategy: generateStrategy(['竭血残蝶', '剑挥四方', '破寂同灾'], ['幻影蝶', '六界帝神', '深渊狱神·哈迪斯']),
    },
};

export default data;
