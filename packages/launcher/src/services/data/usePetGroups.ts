import type { LauncherConfigType, Recipe } from '@sea/server';
import { produce } from 'immer';
import { useCallback } from 'react';
import { dataApi } from '../data';

type PetGroups = LauncherConfigType['PetGroups'];

export const usePetGroups = () => {
    const { data, ...results } = dataApi.useLauncherConfigItemQuery('PetGroups');
    const [trigger] = dataApi.endpoints.setLauncherConfigItem.useMutation();
    const mutate = useCallback(
        (recipe: Recipe<PetGroups>) => trigger({ key: 'PetGroups', value: produce(data, recipe) }),
        [data, trigger]
    );
    return { petGroups: data as PetGroups, mutate, ...results };
};
