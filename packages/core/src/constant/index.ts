export { SA_CONST_EVENTS as Hook } from './event-hooks';
export { SA_CONST_ITEMS as Item } from './item';
export { PetPosition, BattleFireType, PetFragmentLevelDifficulty };

const PetPosition = {
    bag1: 1,
    secondBag1: 7,
    elite: 4,
    storage: 0,
} as const;

enum BattleFireType {
    绿火 = 6,
    金火 = 9,
}

enum PetFragmentLevelDifficulty {
    NotSelected = 0,
    Ease = 1,
    Normal = 2,
    Hard = 3,
}
