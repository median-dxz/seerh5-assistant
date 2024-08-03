import { PetFragmentLevel } from '@sea/core';
import { MOD_SCOPE_BUILTIN, getCompositeId } from '@sea/mod-resolver';

import { PET_FRAGMENT_LEVEL_ID } from '@/constants';

declare const config: {
    xml: {
        getAnyRes: (name: 'new_super_design') => {
            Root: {
                Design: seerh5.PetFragmentLevelObj[];
            };
        };
    };
};

let petFragmentLevelCache: PetFragmentLevel[];

const allPetFragmentLevels = () => {
    if (!petFragmentLevelCache) {
        petFragmentLevelCache = config.xml
            .getAnyRes('new_super_design')
            .Root.Design.map((o) => new PetFragmentLevel(o));
    }
    return petFragmentLevelCache;
};

export const petFragmentLevels = {
    selectById: (id: number) => allPetFragmentLevels().find((o) => o.id === id),
    all: allPetFragmentLevels
};

export const validatePrimitive = (value: number | string) => {
    if (typeof value === 'number') {
        return !isNaN(value);
    }
    return value.trim() !== '';
};

export const cid = getCompositeId({ id: PET_FRAGMENT_LEVEL_ID, scope: MOD_SCOPE_BUILTIN });

export { BattleSelector } from './BattleSelector';
export { DifficultySelector } from './DifficultySelector';
export { OptionsListContext, useOptionsList } from './useOptionsList';
