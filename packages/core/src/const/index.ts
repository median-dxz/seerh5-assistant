export { SA_CONST_EVENTS as EVENTS } from './event-hooks';
export { SA_CONST_ITEMS as ITEMS } from './item';
export { PetPos as PET_POS };
export { BattleFire as BATTLE_FIRE };

const PetPos = {
    bag1: 1,
    secondBag1: 7,
    elite: 4,
    storage: 0,
} as const;

const BattleFire = {
    绿火: 6,
    金火: 9,
} as const;
