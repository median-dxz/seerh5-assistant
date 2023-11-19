export const BattleStrategy = createLocalStorageProxy('BattleStrategy', {
    dsl: [] as string[][],
    snm: [] as string[][],
});

export const PetGroups = createLocalStorageProxy('PetGroups', Array(6).fill([]) as number[][]);