import { MoveStrategy, Operator, generateStrategyByName, matchNoBloodChain, matchSkillName } from 'sea-core';
import * as Battle from 'sea-core/battle';
import * as SAEntity from 'sea-core/entity';

interface LevelPetsData {
    [levelName: string]: {
        cts: number[];
        strategy: MoveStrategy;
    };
}

const data: LevelPetsData = {
    LevelXTeamRoom: {
        cts: [1656056275, 1656945596, 1657863632],
        strategy: generateStrategyByName(['幻梦芳逝', '剑挥四方', '破寂同灾'], ['蒂朵', '六界帝神', '深渊狱神·哈迪斯']),
    },
    LevelExpTraining: {
        cts: [1656092908, 1656055512, 1656056275],
        strategy: {
            async resolveMove(round, skills, _pets) {
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
                return Battle.Operator.useSkill(r?.id);
            },
            async resolveNoBlood(round, skills, pets) {
                const next = matchNoBloodChain(['圣灵谱尼', '幻影蝶', '蒂朵'])(pets, round.self!.catchtime);
                const r = await Battle.Operator.switchPet(next);
                if (!r) Battle.Operator.auto();
                return true;
            },
        },
    },
    LevelStudyTraining: {
        cts: [1656055512, 1655101462, 1656302059, 1657039061],
        strategy: generateStrategyByName(['有女初长成', '王·龙子盛威决', '竭血残蝶'], ['幻影蝶', '艾欧丽娅', '千裳']),
    },
    LevelCourageTower: {
        cts: [1656055512, 1656302059, 1656056275, 1656092908],
        strategy: {
            async resolveMove(round, skills, _pets) {
                let r = matchSkillName(['王·龙子盛威决', '竭血残蝶', '时空牵绊'])(skills);
                if (!r) {
                    r = skills.find((skill) => skill.name === ['光荣之梦', '神灵救世光'][round.round % 2])?.id;
                }
                // eslint-disable-next-line react-hooks/rules-of-hooks
                return Operator.useSkill(r);
            },
            async resolveNoBlood(round, skills, pets) {
                const next = matchNoBloodChain(['幻影蝶', '圣灵谱尼', '蒂朵'])(pets, round.self!.catchtime);
                const r = await Battle.Operator.switchPet(next);
                if (!r) Battle.Operator.auto();
                return true;
            },
        },
    },
    LevelTitanHole: {
        cts: [1656055512, 1656945596, 1657863632, 1655101462, 1656092908],
        strategy: generateStrategyByName(
            ['竭血残蝶', '剑挥四方', '破寂同灾', '神灵救世光', '有女初长成'],
            ['幻影蝶', '六界帝神', '深渊狱神·哈迪斯']
        ),
    },
    LevelElfKingsTrial: {
        cts: [1656055512, 1656945596, 1657863632],
        strategy: generateStrategyByName(
            ['竭血残蝶', '剑挥四方', '破寂同灾'],
            ['幻影蝶', '六界帝神', '深渊狱神·哈迪斯']
        ),
    },
};

export default data;
