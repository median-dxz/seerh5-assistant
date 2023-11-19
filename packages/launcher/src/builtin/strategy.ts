import { Potion, Skill, type MoveStrategy } from 'sea-core';
import * as Battle from 'sea-core/battle';

export default [
    {
        id: '圣谱单挑',
        strategy: {
            resolveMove: (round, skills) => {
                const r = skills.find((skill) => skill.name === ['光荣之梦', '神灵救世光'][round.round % 2]);
                return Battle.Operator.useSkill(r?.id);
            },
            resolveNoBlood: async () => true,
        },
    },
    {
        id: '圣谱先手',
        strategy: {
            resolveMove: (round, skills) => {
                const r = skills.find((skill) => skill.name === ['光荣之梦', '神灵之触'][round.round % 2]);
                return Battle.Operator.useSkill(r?.id);
            },
            resolveNoBlood: async () => true,
        },
    },
    {
        id: '王哈单挑',
        strategy: {
            resolveMove: (round, skills) => {
                let r = skills.find((skill) => skill.name === ['狂龙击杀', '龙子诞生'][round.round % 2]);
                if (r && r.name === '龙子诞生' && r.pp === 0) {
                    r = skills.find((skill) => skill.name === '王·龙子盛威决');
                }
                return Battle.Operator.useSkill(r?.id);
            },
            resolveNoBlood: async () => true,
        },
    },
    {
        id: '蒂朵单挑',
        strategy: {
            resolveMove: (round, skills) => {
                let r;
                if (round.round === 0) {
                    r = skills.find((skill) => skill.name === '时空牵绊');
                } else {
                    r = skills.find((skill) => skill.name === ['朵·盛夏咏叹', '灵籁之愿'][round.round % 2]);
                }
                return Battle.Operator.useSkill(r?.id);
            },
            resolveNoBlood: async () => true,
        },
    },
    {
        id: '潘蒂表必先',
        strategy: Battle.generateStrategyByName(
            ['鬼焰·焚身术', '幻梦芳逝', '诸界混一击', '梦境残缺', '月下华尔兹', '守御八方'],
            ['潘克多斯', '蒂朵', '帝皇之御', '魔钰', '月照星魂', '时空界皇']
        ),
    },
    {
        id: '克朵补刀',
        strategy: Battle.generateStrategyByName(
            ['诸界混一击', '剑挥四方', '守御八方', '破寂同灾'],
            ['帝皇之御', '六界帝神', '时空界皇', '深渊狱神·哈迪斯']
        ),
    },
    {
        id: '索强攻',
        strategy: Battle.generateStrategyByName(['烈火净世击'], ['鲁肃', '芳馨·茉蕊儿', '混沌魔君索伦森']),
    },
    {
        id: '千裳单挑',
        strategy: {
            resolveNoBlood: async () => true,
            resolveMove: (round, skills, _) => {
                let r: Skill | undefined = undefined;
                const { round: t } = round;
                if (t === 0) {
                    r = skills.find((skill) => skill.name === '落花');
                } else {
                    r = skills.find((skill) => skill.name === '浮梦千裳诀');
                }
                if (r && r.pp > 0) {
                    return Battle.Operator.useSkill(r?.id);
                } else {
                    return Battle.Operator.useItem(Potion.中级活力药剂);
                }
            },
        },
    },
] satisfies Array<{ id: string; strategy: MoveStrategy }>;
