import type { VERSION as _CORE_VERSION } from '@sea/core';

export const VERSION = '0.7.0';
export const CORE_VERSION: _CORE_VERSION = '1.0.0-rc.5';
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

export const DS = {
    multiValue: {
        autoCure: 'swr://multiValue/autoCure',
        battleFire: 'swr://multiValue/battleFire',
        eyeEquipment: 'swr://multiValue/eyeEquipment',
        title: 'swr://multiValue/title',
        suit: 'swr://multiValue/suit'
    },
    petBag: 'ds://PetBag'
};

export const MOD_BUILTIN_UPDATE_STRATEGY: 'always' | 'never' | 'version' = 'always';
