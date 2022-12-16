export { SA_CONST_CMDID as CMDID } from './cmdid';
export { SA_CONST_EVENTS as EVENTS } from './event';
export { SA_CONST_ITEMS as ITEMS } from './item';
export { SA_CONST_MULTI as MULTI } from './multivalues';
export { ElvenKingId as E_KING_ID };
export { PetPos as PET_POS };
export { BattleFire as BATTLE_FIRE };


const ElvenKingId = {
    光王斯嘉丽: 2,
    水王沧岚: 8,
    自然王莫妮卡: 17,
    龙妈乔特鲁德: 6,
    草王茉蕊儿: 15,
    海瑟薇: 12,
    邪灵王摩哥斯: 14,
} as const;

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
