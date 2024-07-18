import type { seac } from '@sea/core';

export const VERSION = '0.9.0';
export const CORE_VERSION: typeof seac.version = '1.0.0';
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
export const PET_FRAGMENT_LEVEL_ID = 'PetFragmentLevel';

export const MOD_BUILTIN_UPDATE_STRATEGY: 'always' | 'never' | 'version' = 'always';

export const QueryKeys = {
    mod: {
        data: (cid: string) => `db//mod/data/${cid}`,
        config: (cid: string) => `db//mod/config/${cid}`
    },
    taskConfig: (cid: string) => `db://taskConfig/${cid}`
};
