import * as SABattle from 'sa-../battle/index.js';
import * as SAEntity from 'sa-../entity/index.js';
import { MoveModule, NoBloodSwitchLink, Operator, SkillNameMatch, generateStrategy } from 'sa-core';

interface LevelPetsData {
    [levelName: string]: {
        cts: number[];
        strategy: MoveModule;
    };
}

const data: LevelPetsData = {
    LevelXTeamRoom: {
        cts: [1656056275, 1656945596, 1657863632],
        strategy: generateStrategy(['幻梦芳逝', '剑挥四方', '破寂同灾'], ['蒂朵', '六界帝神', '深渊狱神·哈迪斯']),
    },
    LevelExpTraining: {
        cts: [1656092908, 1656055512, 1656056275],
        strategy: {
            async resolveMove(round, skills, pets) {
                const selfPetName = round.self!.name;
                let r: SAEntity.Skill | undefined;
                if (selfPetName === '圣灵谱尼') {
                    r = skills.find((skill) => skill.name === ['光荣之梦', '神灵救世光'][round.round % 2]);
                } else if (selfPetName === '蒂朵') {
                    // console.log(round.other!.hp.remain, round.other!.hp.max, round.other!.hp.remain / round.other!.hp.max);
                    const hp = round.other!.hp;
                    if (hp.max > 0 && hp.remain / hp.max <= 0.28) {
                        r = skills.find((skill) => skill.name === '时空牵绊');
                    } else {
                        r = skills.find((skill) => skill.name === ['琴·万律归一', '朵·盛夏咏叹'][round.round % 2]);
                    }
                } else {
                    r = skills.find((skill) => skill.name === '竭血残蝶');
                }
                return SABattle.Operator.useSkill(r?.id);
            },
            resolveNoBlood(round, skills, pets) {
                const dsl = new NoBloodSwitchLink(['圣灵谱尼', '幻影蝶', '蒂朵']);
                return dsl.match(pets, round.self!.catchtime);
            },
        },
    },
    LevelStudyTraining: {
        cts: [1656055512, 1655101462, 1656302059, 1657039061],
        strategy: generateStrategy(['有女初长成', '王·龙子盛威决', '竭血残蝶'], ['幻影蝶', '艾欧丽娅', '千裳']),
    },
    LevelCourageTower: {
        cts: [1656055512, 1656302059, 1656056275, 1656092908],
        strategy: {
            async resolveMove(round, skills, pets) {
                const snm = new SkillNameMatch(['王·龙子盛威决', '竭血残蝶', '时空牵绊']);
                let r = snm.match(skills);
                if (!r) {
                    r = skills.find((skill) => skill.name === ['光荣之梦', '神灵救世光'][round.round % 2])?.id;
                }
                return Operator.useSkill(r);
            },
            resolveNoBlood(round, skills, pets) {
                const dsl = new NoBloodSwitchLink(['幻影蝶', '圣灵谱尼', '蒂朵']);
                return dsl.match(pets, round.self!.catchtime);
            },
        },
    },
    LevelTitanHole: {
        cts: [1656055512, 1656945596, 1657863632, 1655101462, 1656092908],
        strategy: generateStrategy(
            ['竭血残蝶', '剑挥四方', '破寂同灾', '神灵救世光', '有女初长成'],
            ['幻影蝶', '六界帝神', '深渊狱神·哈迪斯']
        ),
    },
    LevelElfKingsTrial: {
        cts: [1656055512, 1656945596, 1657863632],
        strategy: generateStrategy(['竭血残蝶', '剑挥四方', '破寂同灾'], ['幻影蝶', '六界帝神', '深渊狱神·哈迪斯']),
    },
};

export default data;
