import { DS } from '@/constants';
import type { Pet } from 'sea-core';
import { PetPosition, SEAEventSource, Subscription, debounce, getBagPets } from 'sea-core';
import type { SWRSubscriptionOptions } from 'swr/subscription';
import useSWRSubscription from 'swr/subscription';

export function useBagPets() {
    const { data: pets } = useSWRSubscription(
        DS.petBag,
        (_, { next }: SWRSubscriptionOptions<Pet[], Error>) => {
            getBagPets(PetPosition.bag1).then((pets) => next(null, pets));
            const subscription = new Subscription();

            subscription.on(SEAEventSource.hook('pet_bag:deactivate'), debounce(getBagPets, 100));
            subscription.on(
                SEAEventSource.hook('pet_bag:update'),
                debounce((pets) => {
                    next(null, pets[0]);
                }, 100)
            );

            return () => subscription.dispose();
        },
        {
            fallbackData: null,
        }
    );
    return { pets };
}
