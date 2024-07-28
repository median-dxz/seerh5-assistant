import { PetFragmentLevel } from '@sea/core';

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

export { BattleSelector } from './BattleSelector';
export { DifficultySelector } from './DifficultySelector';
