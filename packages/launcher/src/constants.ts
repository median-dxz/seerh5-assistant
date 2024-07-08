import type { seac } from '@sea/core';

export const VERSION = '0.8.0';
export const CORE_VERSION: typeof seac.version = '1.0.0-rc.6';
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

export const MOD_SCOPE_DEFAULT = 'external';
export const MOD_SCOPE_BUILTIN = 'builtin';

export const QueryKey = {
    multiValue: {
        autoCure: 'game://multiValue/autoCure',
        battleFire: 'game://multiValue/battleFire',
        eyeEquipment: 'game://multiValue/eyeEquipment',
        title: 'game://multiValue/title',
        suit: 'game://multiValue/suit'
    },
    petBag: 'db://PetBag',
    taskConfig: 'db://taskConfig',
    taskIsCompleted: 'task://isCompleted'
};

export const MOD_BUILTIN_UPDATE_STRATEGY: 'always' | 'never' | 'version' = 'always';
