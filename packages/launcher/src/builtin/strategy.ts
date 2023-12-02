/* eslint-disable react-hooks/rules-of-hooks */
import { VERSION } from '@/constants';
import { Operator, generateStrategyByName } from 'sea-core/battle';
import { Potion } from 'sea-core/constant';
import type { Skill } from 'sea-core/entity';

const noop = async () => true;

export default async function builtinStrategies(createContext: SEAL.createModContext) {
    const { meta } = await createContext({
        meta: { id: 'builtin-strategies', scope: 'builtin', version: VERSION, description: '内置战斗策略模型' },
    });

    const strategy: Array<SEAL.Strategy> = [
        {
            name: '圣谱单挑',
            resolveMove: (round, skills) => {
                const r = skills.find((skill) => skill.name === ['光荣之梦', '神灵救世光'][round.round % 2]);
                return Operator.useSkill(r?.id);
            },
            resolveNoBlood: noop,
        },
        {
            name: '圣谱先手',
            resolveMove: (round, skills) => {
                const r = skills.find((skill) => skill.name === ['光荣之梦', '神灵之触'][round.round % 2]);
                return Operator.useSkill(r?.id);
            },
            resolveNoBlood: noop,
        },
        {
            name: '王哈单挑',
            resolveMove: (round, skills) => {
                let r = skills.find((skill) => skill.name === ['狂龙击杀', '龙子诞生'][round.round % 2]);
                if (r && r.name === '龙子诞生' && r.pp === 0) {
                    r = skills.find((skill) => skill.name === '王·龙子盛威决');
                }
                return Operator.useSkill(r?.id);
            },
            resolveNoBlood: noop,
        },
        {
            name: '蒂朵单挑',
            resolveMove: (round, skills) => {
                let r;
                if (round.round === 0) {
                    r = skills.find((skill) => skill.name === '时空牵绊');
                } else {
                    r = skills.find((skill) => skill.name === ['朵·盛夏咏叹', '灵籁之愿'][round.round % 2]);
                }
                return Operator.useSkill(r?.id);
            },
            resolveNoBlood: noop,
        },
        {
            name: '潘蒂表必先',
            ...generateStrategyByName(
                ['鬼焰·焚身术', '幻梦芳逝', '诸界混一击', '梦境残缺', '月下华尔兹', '守御八方'],
                ['潘克多斯', '蒂朵', '帝皇之御', '魔钰', '月照星魂', '时空界皇']
            ),
        },
        {
            name: '克朵补刀',
            ...generateStrategyByName(
                ['诸界混一击', '剑挥四方', '守御八方', '破寂同灾'],
                ['帝皇之御', '六界帝神', '时空界皇', '深渊狱神·哈迪斯']
            ),
        },
        {
            name: '索强攻',
            ...generateStrategyByName(['烈火净世击'], ['鲁肃', '芳馨·茉蕊儿', '混沌魔君索伦森']),
        },
        {
            name: '千裳单挑',
            resolveNoBlood: noop,
            resolveMove: (round, skills, _) => {
                let r: Skill | undefined = undefined;
                const { round: t } = round;
                if (t === 0) {
                    r = skills.find((skill) => skill.name === '落花');
                } else {
                    r = skills.find((skill) => skill.name === '浮梦千裳诀');
                }
                if (r && r.pp > 0) {
                    return Operator.useSkill(r?.id);
                } else {
                    return Operator.useItem(Potion.中级活力药剂);
                }
            },
        },
    ];

    return {
        meta,
        exports: {
            strategy,
        },
    } as SEAL.ModExport;
}
