import { DS } from '@/constants';
import type { Pet } from 'sea-core';
import { PetLocation, SEAEventSource, Subscription, debounce, getBagPets } from 'sea-core';
import type { SWRSubscriptionOptions } from 'swr/subscription';
import useSWRSubscription from 'swr/subscription';

export function useBagPets() {
    const { data: pets } = useSWRSubscription(
        DS.petBag,
        (_, { next }: SWRSubscriptionOptions<Pet[], Error>) => {
            getBagPets(PetLocation.Bag).then((pets) => next(null, pets));
            const sub = new Subscription();
            sub.on(SEAEventSource.hook('pet_bag:deactivate'), debounce(getBagPets, 500));
            sub.on(SEAEventSource.hook('pet_bag:update'), (pets) => {
                next(null, pets[0]);
            });
            return () => sub.dispose();
        },
        {
            fallbackData: null,
        }
    );
    return { pets };
}
