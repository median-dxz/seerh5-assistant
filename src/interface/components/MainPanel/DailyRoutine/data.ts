import { AutoBattle, BaseStrategy, generateStrategy, InfoProvider, Operator } from '@sa-core/battle-module';
import { delay } from '@sa-core/common';

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
            {
                name: '圣灵谱尼',
                catchTime: 1656092908,
            },
        ],
        strategy: async (round, skills, pets) => {
            const snm = new BaseStrategy.SkillNameMatch(['王·龙子盛威决', '竭血残蝶', '时空牵绊']);
            const dsl = new BaseStrategy.DiedSwitchLink(['幻影蝶', '圣灵谱尼', '蒂朵']);
            if (round.isDiedSwitch) {
                const r = dsl.match(pets, round.self!.catchtime);
                if (r !== -1) {
                    Operator.switchPet(r);
                } else {
                    Operator.auto();
                }
                await delay(600);
                skills = InfoProvider.getCurSkills()!;
            }
            const r = snm.match(skills);
            if (r) {
                Operator.useSkill(r);
            } else {
                const r = skills.find((skill) => skill.name === ['光荣之梦', '神灵救世光'][round.round % 2]);
                if (r) {
                    Operator.useSkill(r.id);
                } else {
                    Operator.auto();
                }
            }
        },
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
