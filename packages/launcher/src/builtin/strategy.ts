import { CORE_VERSION, MOD_SCOPE_BUILTIN, VERSION } from '@/constants';
import type { CreateModContext, ModExport, Strategy } from '@/sea-launcher';
import { PotionId, battle, strategy as sg } from '@sea/core';

const { name, rotating, auto, round, match } = sg;

export default async function builtinStrategy(createContext: CreateModContext) {
    const { meta } = await createContext({
        meta: {
            id: 'builtin-strategy',
            scope: MOD_SCOPE_BUILTIN,
            version: VERSION,
            core: CORE_VERSION,
            description: '内置战斗策略模型',
        },
    });

    const strategies: Array<Strategy> = [
        {
            name: '圣谱单挑',
            resolveMove: (state, skills, pets) => {
                return battle.executor.useSkill(match(state, skills, pets)(rotating('光荣之梦', '神灵救世光')));
            },
            resolveNoBlood: auto.noBlood(),
        },
        {
            name: '圣谱先手',
            resolveMove: (state, skills, pets) => {
                return battle.executor.useSkill(match(state, skills, pets)(rotating('光荣之梦', '神灵之触')));
            },
            resolveNoBlood: auto.noBlood(),
        },
        {
            name: '王哈单挑',
            resolveMove: (state, skills, pets) => {
                return battle.executor.useSkill(
                    match(state, skills, pets)(rotating('狂龙击杀', '龙子诞生'), name('王·龙子盛威决'))
                );
            },
            resolveNoBlood: auto.noBlood(),
        },
        {
            name: '蒂朵单挑',
            resolveMove: (state, skills, pets) => {
                return battle.executor.useSkill(
                    match(
                        state,
                        skills,
                        pets
                    )(
                        round((r) => r === 0, name('时空牵绊')),
                        rotating('朵·盛夏咏叹', '灵籁之愿')
                    )
                );
            },
            resolveNoBlood: auto.noBlood(),
        },
        {
            name: '潘蒂表必先',
            resolveMove: auto.move(['鬼焰·焚身术', '幻梦芳逝', '诸界混一击', '梦境残缺', '月下华尔兹', '守御八方']),
            resolveNoBlood: auto.noBlood(['潘克多斯', '蒂朵', '帝皇之御', '魔钰', '月照星魂', '时空界皇']),
        },
        {
            name: '克朵补刀',
            resolveMove: auto.move(['诸界混一击', '剑挥四方', '守御八方', '破寂同灾']),
            resolveNoBlood: auto.noBlood(['帝皇之御', '六界帝神', '时空界皇', '深渊狱神·哈迪斯']),
        },
        {
            name: '索强攻',
            resolveMove: auto.move(['烈火净世击']),
            resolveNoBlood: auto.noBlood(['鲁肃', '芳馨·茉蕊儿', '混沌魔君索伦森']),
        },
        {
            name: '千裳单挑',
            resolveNoBlood: auto.noBlood(),
            resolveMove: (state, skills, pet) => {
                const r = match(
                    state,
                    skills,
                    pet
                )(
                    round((r) => r === 0, name('落花')),
                    name('浮梦千裳诀')
                );

                if (r) {
                    return battle.executor.useSkill(r);
                } else {
                    return battle.executor.useItem(PotionId.中级活力药剂);
                }
            },
        },
        {
            name: 'LevelXTeamRoom',
            resolveMove: auto.move(['幻梦芳逝', '剑挥四方', '破寂同灾']),
            resolveNoBlood: auto.noBlood(['蒂朵', '六界帝神', '深渊狱神·哈迪斯']),
        },
        {
            name: 'LevelExpTraining',
            async resolveMove(state, skills, pets) {
                const r = await battle.executor.useSkill(
                    match(
                        state,
                        skills,
                        pets
                    )(name('竭血残蝶', '巫祝祈愿符', '幻梦芳逝'), rotating('暴政统治者', '暴君意志', '闪光次元击'))
                );
                if (!r) battle.executor.auto();
                return true;
            },
            resolveNoBlood: auto.noBlood(['幻影蝶', '西斯里', '蒂朵', '暴君史莱姆']),
        },
        {
            name: 'LevelStudyTraining',
            resolveMove: auto.move(['有女初长成', '疾击之刺', '浮梦千裳诀', '竭血残蝶']),
            resolveNoBlood: auto.noBlood(['幻影蝶', '艾欧丽娅', '千裳']),
        },
        {
            name: 'LevelCourageTower',
            async resolveMove(state, skills, pets) {
                const matcher = match(state, skills, pets);
                const r = battle.executor.useSkill(
                    matcher(
                        name('竭血残蝶', '时空牵绊'),
                        rotating('光荣之梦', '神灵救世光'),
                        rotating('龙子诞生', '王·龙子盛威决'),
                        rotating('狂龙击杀', '王·龙战八荒')
                    )
                );
                if (!r) battle.executor.auto();
                return true;
            },
            resolveNoBlood: auto.noBlood(['幻影蝶', '王之哈莫', '蒂朵']),
        },
        {
            name: 'LevelTitanHole',
            resolveMove: auto.move(['竭血残蝶', '剑挥四方', '破寂同灾', '神灵救世光', '有女初长成', '魂魄缠绕']),
            resolveNoBlood: auto.noBlood(['幻影蝶', '六界帝神', '深渊狱神·哈迪斯']),
        },
        {
            name: 'LevelElfKingsTrial',
            resolveMove: auto.move(['竭血残蝶', '剑挥四方', '破寂同灾']),
            resolveNoBlood: auto.noBlood(['幻影蝶', '六界帝神', '深渊狱神·哈迪斯']),
        },
        {
            name: 'auto',
            resolveMove: auto.move(),
            resolveNoBlood: auto.noBlood(),
        },
    ];

    return {
        meta,
        exports: {
            strategy: strategies,
        },
    } satisfies ModExport;
}
