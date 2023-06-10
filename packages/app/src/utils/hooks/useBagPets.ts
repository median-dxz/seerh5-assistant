import React from 'react';
import type { Pet } from 'sa-core';
import { Hook, PetPosition, SAEventBus, SAEventTarget, debounce, getBagPets } from 'sa-core';
import type { SWRSubscriptionOptions } from 'swr/subscription';
import useSWRSubscription from 'swr/subscription';

export function useBagPets() {
    const { data: pets } = useSWRSubscription(
        'ds://PetBag',
        React.useCallback((_, { next }: SWRSubscriptionOptions<Pet[], Error>) => {
            const eventBus = new SAEventBus();
            eventBus.hook(
                Hook.PetBag.deactivate,
                debounce(async () => {
                    const pets = await getBagPets(PetPosition.bag1);
                    next(null, pets);
                }, 100)
            );
            eventBus.hook(
                Hook.PetBag.update,
                debounce((pets) => {
                    next(null, pets[0]);
                }, 100)
            );
            SAEventTarget.emit(Hook.PetBag.deactivate);
            return eventBus.unmount.bind(eventBus);
        }, []),
        {
            fallbackData: null,
        }
    );
    return { pets };
}
