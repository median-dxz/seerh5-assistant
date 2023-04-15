import { createLocalStorageProxy } from 'seerh5-assistant-core';

export const StorageKeys = {
    BattleStrategy: [
        'BattleStrategy',
        {
            dsl: [],
            snm: [],
        },
        JSON.stringify,
        JSON.parse,
    ] as Parameters<
        typeof createLocalStorageProxy<{
            dsl: string[][];
            snm: string[][];
        }>
    >,
    PetGroups: ['PetGroups', Array(6), JSON.stringify, JSON.parse] as Parameters<
        typeof createLocalStorageProxy<Array<number[]>>
    >,
};

// PetBagScheme: 'PetBagScheme',
// LocalSkin: 'LocalSkin',
// CommandShortcut: 'CommandShortcut',
