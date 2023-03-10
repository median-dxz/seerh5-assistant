export { SA_CONST_EVENTS as Hook } from './event-hooks';
export { SA_CONST_ITEMS as Item } from './item';
export { PetPosition, BattleFire };

const PetPosition = {
    bag1: 1,
    secondBag1: 7,
    elite: 4,
    storage: 0,
} as const;

const BattleFire = {
    绿火: 6,
    金火: 9,
} as const;
