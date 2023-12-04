export const VERSION = '0.6.1'
export const EVENT_SEER_READY = 'seerh5_load';
export const IS_DEV = import.meta.env.DEV;
export const CMD_MASK = [
    1002, // SYSTEM_TIME
    2001, // ENTER_MAP
    2002, // LEAVE_MAP
    2004, // MAP_OGRE_LIST
    2441, // LOAD_PERCENT
    9019, // NONO_FOLLOW_OR_HOOM
    9274, //PET_GET_LEVEL_UP_EXP
    41228, // SYSTEM_TIME_CHECK
];

export const MOD_SCOPE_DEFAULT = 'external';
export const MOD_SCOPE_BUILTIN = 'builtin';