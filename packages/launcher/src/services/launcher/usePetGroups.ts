import { produce } from 'immer';
import { useCallback } from 'react';

import type { LauncherConfigType, Recipe } from '@sea/server';

import { launcherApi } from './api';

type PetGroups = LauncherConfigType['PetGroups'];

export const usePetGroups = () => {
    const { data, ...results } = launcherApi.useConfigItemQuery('PetGroups');
    const [trigger] = launcherApi.useSetConfigItemMutation();
    const mutate = useCallback(
        (recipe: Recipe<PetGroups>) => trigger({ key: 'PetGroups', value: produce(data, recipe) }),
        [data, trigger]
    );
    return { petGroups: data as PetGroups, mutate, ...results };
};
