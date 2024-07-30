import type { PetFragmentOptions } from '@/builtin/petFragment/types';
import type { Recipe } from '@sea/server';
import { createContext, useContext } from 'react';

export interface OptionsListContextValue {
    optionsList: PetFragmentOptions[];
    mutate: (recipe: Recipe<PetFragmentOptions[]>) => void;
}

export const OptionsListContext = createContext({} as OptionsListContextValue);

export function useOptionsList() {
    return useContext(OptionsListContext);
}
