import React from 'react';
import type { Pet } from 'sea-core';
import { Hook, PetPosition, SEAEventSource, Subscription, debounce, getBagPets } from 'sea-core';
import type { SWRSubscriptionOptions } from 'swr/subscription';
import useSWRSubscription from 'swr/subscription';

export function useBagPets() {
    const { data: pets } = useSWRSubscription(
        'ds://PetBag',
        React.useCallback((_, { next }: SWRSubscriptionOptions<Pet[], Error>) => {
            getBagPets(PetPosition.bag1).then((pets) => next(null, pets));
            const subscription = new Subscription();

            subscription.on(SEAEventSource.hook(Hook.PetBag.deactivate), debounce(getBagPets, 100));
            subscription.on(
                SEAEventSource.hook(Hook.PetBag.update),
                debounce((pets) => {
                    next(null, pets[0]);
                }, 100)
            );

            return () => subscription.dispose();
        }, []),
        {
            fallbackData: null,
        }
    );
    return { pets };
}
