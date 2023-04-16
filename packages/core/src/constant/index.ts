export * from './event-hooks';
export * from './item-id';

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

export const ConfigType = {
    item: {} as SAType.ItemObj,
    suit: {} as SAType.SuitObj,
    title: {} as SAType.TitleObj,
    element: {} as SAType.ElementObj,
    skill: {} as SAType.MoveObj,
    pet: {} as SAType.PetObj,
    statusEffect: {} as SAType.StatusEffectObj,
};
