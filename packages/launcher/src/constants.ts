import { PetFragmentLevelDifficulty as Difficulty, seac } from '@sea/core';

export const VERSION = '0.11.1';
export const CORE_VERSION: typeof seac.version = seac.version;
export const IS_DEV = import.meta.env.DEV;
export const CMD_MASK = [
    1002, // SYSTEM_TIME
    2001, // ENTER_MAP
    2002, // LEAVE_MAP
    2004, // MAP_OGRE_LIST
    2441, // LOAD_PERCENT
    9019, // NONO_FOLLOW_OR_HOOM
    9274, //PET_GET_LEVEL_UP_EXP
    41228 // SYSTEM_TIME_CHECK
];

export const MOD_BUILTIN_UPDATE_STRATEGY: 'always' | 'never' | 'version' = 'always';
export const PET_FRAGMENT_LEVEL_ID = 'PetFragmentLevel';

export const DifficultyText = {
    [Difficulty.NotSelected]: '未选择',
    [Difficulty.Ease]: '简单',
    [Difficulty.Normal]: '困难',
    [Difficulty.Hard]: '地狱'
} as const;
