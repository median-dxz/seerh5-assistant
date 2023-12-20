import { CORE_VERSION, MOD_SCOPE_BUILTIN, VERSION } from '@/constants';
import { SEABattle, Strategy } from '@sea/core';
import { PotionId } from '@sea/core/constant';

const noop = async () => true;

export default async function builtinStrategy(createContext: SEAL.createModContext) {
    const { meta } = await createContext({
        meta: {
            id: 'builtin-strategy',
            scope: MOD_SCOPE_BUILTIN,
            version: VERSION,
            core: CORE_VERSION,
            description: '内置战斗策略模型',
        },
    });

    const strategy: Array<SEAL.Strategy> = [
        {
            name: '圣谱单挑',
            resolveMove: ({ round }, skills) => {
                const r = Strategy.matchRotatingSkills(['光荣之梦', '神灵救世光'])(skills, round);
                return SEABattle.operator.useSkill(r);
            },
            resolveNoBlood: noop,
        },
        {
            name: '圣谱先手',
            resolveMove: ({ round }, skills) => {
                const r = Strategy.matchRotatingSkills(['光荣之梦', '神灵之触'])(skills, round);
                return SEABattle.operator.useSkill(r);
            },
            resolveNoBlood: noop,
        },
        {
            name: '王哈单挑',
            resolveMove: ({ round }, skills) => {
                let r = skills.find((skill) => skill.name === ['狂龙击杀', '龙子诞生'][round % 2]);
                if (r && r.name === '龙子诞生' && r.pp === 0) {
                    r = skills.find((skill) => skill.name === '王·龙子盛威决');
                }
                return SEABattle.operator.useSkill(r?.id);
            },
            resolveNoBlood: noop,
        },
        {
            name: '蒂朵单挑',
            resolveMove: ({ round }, skills) => {
                let r;
                if (round === 0) {
                    r = Strategy.matchSkillName('时空牵绊')(skills);
                } else {
                    r = Strategy.matchRotatingSkills(['朵·盛夏咏叹', '灵籁之愿'])(skills, round);
                }
                return SEABattle.operator.useSkill(r);
            },
            resolveNoBlood: noop,
        },
        {
            name: '潘蒂表必先',
            ...Strategy.generateByName(
                ['鬼焰·焚身术', '幻梦芳逝', '诸界混一击', '梦境残缺', '月下华尔兹', '守御八方'],
                ['潘克多斯', '蒂朵', '帝皇之御', '魔钰', '月照星魂', '时空界皇']
            ),
        },
        {
            name: '克朵补刀',
            ...Strategy.generateByName(
                ['诸界混一击', '剑挥四方', '守御八方', '破寂同灾'],
                ['帝皇之御', '六界帝神', '时空界皇', '深渊狱神·哈迪斯']
            ),
        },
        {
            name: '索强攻',
            ...Strategy.generateByName(['烈火净世击'], ['鲁肃', '芳馨·茉蕊儿', '混沌魔君索伦森']),
        },
        {
            name: '千裳单挑',
            resolveNoBlood: noop,
            resolveMove: ({ round }, skills, _) => {
                let r;
                if (round === 0) {
                    r = Strategy.matchSkillName('落花')(skills);
                } else {
                    r = Strategy.matchSkillName('浮梦千裳诀')(skills);
                }
                if (r) {
                    return SEABattle.operator.useSkill(r);
                } else {
                    return SEABattle.operator.useItem(PotionId.中级活力药剂);
                }
            },
        },
        {
            name: 'LevelXTeamRoom',
            ...Strategy.generateByName(['幻梦芳逝', '剑挥四方', '破寂同灾'], ['蒂朵', '六界帝神', '深渊狱神·哈迪斯']),
        },
        {
            name: 'LevelExpTraining',
            async resolveMove({ round }, skills, _) {
                let r;
                r = r ?? Strategy.matchSkillName('竭血残蝶')(skills);
                r = r ?? Strategy.matchSkillName('巫祝祈愿符')(skills);
                r = r ?? Strategy.matchSkillName('幻梦芳逝')(skills);
                r = r ?? Strategy.matchRotatingSkills(['暴政统治者', '暴君意志', '闪光次元击'])(skills, round);
                const callResult = await SEABattle.operator.useSkill(r);
                if (!callResult) SEABattle.operator.auto();
                return true;
            },
            async resolveNoBlood({ self }, _, pets) {
                const next = Strategy.matchNoBloodChain(['幻影蝶', '西斯里', '蒂朵', '暴君史莱姆'])(
                    pets,
                    self.catchtime
                );
                const r = await SEABattle.operator.switchPet(next);
                if (!r) SEABattle.operator.auto();
                return true;
            },
        },
        {
            name: 'LevelStudyTraining',
            ...Strategy.generateByName(
                ['有女初长成', '疾击之刺', '浮梦千裳诀', '竭血残蝶'],
                ['幻影蝶', '艾欧丽娅', '千裳']
            ),
        },
        {
            name: 'LevelCourageTower',
            async resolveMove({ round }, skills, _) {
                let r = Strategy.matchSkillName(['竭血残蝶', '时空牵绊'])(skills);
                r = r ?? Strategy.matchRotatingSkills(['光荣之梦', '神灵救世光'])(skills, round);
                r = r ?? Strategy.matchRotatingSkills(['龙子诞生', '王·龙子盛威决'])(skills, round);
                r = r ?? Strategy.matchRotatingSkills(['狂龙击杀', '王·龙战八荒'])(skills, round);
                const callResult = await SEABattle.operator.useSkill(r);
                if (!callResult) SEABattle.operator.auto();
                return true;
            },
            async resolveNoBlood({ self }, _, pets) {
                const next = Strategy.matchNoBloodChain(['幻影蝶', '王之哈莫', '蒂朵'])(pets, self.catchtime);
                const r = await SEABattle.operator.switchPet(next);
                if (!r) SEABattle.operator.auto();
                return true;
            },
        },
        {
            name: 'LevelTitanHole',
            ...Strategy.generateByName(
                ['竭血残蝶', '剑挥四方', '破寂同灾', '神灵救世光', '有女初长成', '魂魄缠绕'],
                ['幻影蝶', '六界帝神', '深渊狱神·哈迪斯']
            ),
        },
        {
            name: 'LevelElfKingsTrial',
            ...Strategy.generateByName(['竭血残蝶', '剑挥四方', '破寂同灾'], ['幻影蝶', '六界帝神', '深渊狱神·哈迪斯']),
        },
        {
            name: 'auto',
            ...Strategy.auto,
        },
    ];

    return {
        meta,
        exports: {
            strategy,
        },
    } satisfies SEAL.ModExport;
}
