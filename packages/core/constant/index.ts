export * from './event-hooks.js';
export * from './item-id.js';

export const PetPosition = {
    bag1: 1,
    secondBag1: 7,
    elite: 4,
    storage: 0,
} as const;

export enum BattleFireType {
    绿火 = 6,
    金火 = 9,
}

export enum PetFragmentLevelDifficulty {
    NotSelected = 0,
    Ease = 1,
    Normal = 2,
    Hard = 3,
}

export type GameDataType = {
    item: SAType.ItemObj;
    suit: SAType.SuitObj;
    title: SAType.TitleObj;
    element: SAType.ElementObj;
    skill: SAType.MoveObj;
    pet: SAType.PetObj;
    statusEffect: SAType.StatusEffectObj;
};

export const CmdMask = [
    1002, // SYSTEM_TIME
    2001, // ENTER_MAP
    2002, // LEAVE_MAP
    2004, // MAP_OGRE_LIST
    2441, // LOAD_PERCENT
    9019, // NONO_FOLLOW_OR_HOOM
    9274, //PET_GET_LEVEL_UP_EXP
    41228, // SYSTEM_TIME_CHECK
];
