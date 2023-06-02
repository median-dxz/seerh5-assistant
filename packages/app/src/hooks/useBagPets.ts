import React from 'react';
import type { Pet } from 'sa-core';
import { Hook, PetDataManger, SAEventBus, debounce, getBagPets } from 'sa-core';
import type { SWRSubscriptionOptions } from 'swr/subscription';
import useSWRSubscription from 'swr/subscription';

const eventBus = new SAEventBus();

export function useBagPets() {
    const { data: pets } = useSWRSubscription(
        'ds://PetBag',
        React.useCallback((_, { next }: SWRSubscriptionOptions<Pet[], Error>) => {
            eventBus.hook(Hook.PetBag.deactivate, debounce(getBagPets, 100));
            eventBus.hook(
                Hook.PetBag.update,
                debounce((pets) => {
                    next(null, pets[0]);
                }, 100)
            );
            return eventBus.unmount.bind(eventBus);
        }, []),
        {
            fallbackData: PetDataManger.bag.getImmediate()[0],
        }
    );
    return { pets };
}