import { createLocalStorageProxy } from 'sea-core';

export const BattleStrategy = createLocalStorageProxy('BattleStrategy', {
    dsl: [] as string[][],
    snm: [] as string[][],
});
export const PetGroups = createLocalStorageProxy('PetGroups', Array(6).fill([]) as number[][]);

// PetBagScheme: 'PetBagScheme',
// LocalSkin: 'LocalSkin',
// CommandShortcut: 'CommandShortcut',
