export * from './GameHooks.js';
export * from './ItemId.js';
export * from './type.js';

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

// todo: 给出具体的枚举值
export enum SkillType {
    特殊攻击,
    物理攻击,
    属性攻击,
}
