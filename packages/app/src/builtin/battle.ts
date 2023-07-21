import { ct } from '@sa-app/context/ct';
import { BattleModExport } from '@sa-app/service/ModManager/type';
import { lowerBlood } from 'sa-core';

export default [
    {
        id: '潘蒂表必先',
        battle: {
            pets: ['潘克多斯', '蒂朵', '帝皇之御', '魔钰', '月照星魂', '时空界皇'],
            beforeBattle: async () => {
                await lowerBlood(await ct('潘克多斯', '蒂朵', '帝皇之御', '魔钰', '月照星魂', '时空界皇'));
            },
            strategy: '潘蒂表必先',
        },
    },
    {
        id: '圣谱单挑',
        battle: {
            pets: ['圣灵谱尼'],
            strategy: '圣谱单挑',
        },
    },
    {
        id: '圣谱先手',
        battle: {
            pets: ['圣灵谱尼'],
            strategy: '圣谱先手',
        },
    },
    {
        id: '王哈单挑',
        battle: {
            pets: ['王之哈莫'],
            strategy: '王哈单挑',
        },
    },
    {
        id: '蒂朵单挑',
        battle: {
            pets: ['蒂朵'],
            strategy: '王哈单挑',
        },
    },
    {
        id: '千裳单挑',
        battle: {
            pets: ['千裳'],
            strategy: '千裳单挑',
        },
    },
    {
        id: '索强攻',
        battle: {
            pets: ['鲁肃', '芳馨·茉蕊儿', '混沌魔君索伦森'],
            strategy: '索强攻',
        },
    },
] satisfies Array<{ id: string; battle: BattleModExport }>;
