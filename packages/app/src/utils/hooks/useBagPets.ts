import React from 'react';
import type { Pet } from 'sa-core';
import { Hook, PetPosition, SAEventBus, debounce, getBagPets } from 'sa-core';
import type { SWRSubscriptionOptions } from 'swr/subscription';
import useSWRSubscription from 'swr/subscription';

export function useBagPets() {
    const { data: pets } = useSWRSubscription(
        'ds://PetBag',
        React.useCallback((_, { next }: SWRSubscriptionOptions<Pet[], Error>) => {
            getBagPets(PetPosition.bag1).then((pets) => next(null, pets));
            const eventBus = new SAEventBus();
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
            fallbackData: null,
        }
    );
    return { pets };
}
